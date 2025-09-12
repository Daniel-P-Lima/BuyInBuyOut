/**
 * Authentication Service
 * Encapsulates user registration and login using Prisma, bcrypt, and JWT.
 *
 * Dependencies:
 * - Prisma client: ../infra/prisma (expects prisma.user model)
 * - bcryptjs for password hashing/verification
 * - jsonwebtoken for access token issuance
*/

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../infra/prisma");

/**
 * Register a new user.
 *
 * Behavior:
 * 1) Checks if a user already exists with the given email or username.
 * 2) Hashes the provided password with bcrypt (cost = 12).
 * 3) Creates the user record and returns a public projection.
 *
 * Throws:
 * - Error(409) when email or username already exists.
 *
 * @param {Object} params
 * @param {string} params.username - Desired username (unique).
 * @param {string} params.email - User email (unique).
 * @param {string} params.password - Plaintext password to be hashed.
 * @returns {Promise<{id:number, username:string, email:string, createdAt:string}>} Public user fields.
*/

async function register({ username, email, password }) {
    const exists = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
        select: { id: true },
    });

    if (exists) {
        const error = new Error("Email is already in use.");
        error.status = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: { username, email, passwordHash },
        select: { id: true, username: true, email: true, createdAt: true },
    });

    return user;
}

/**
 * Authenticate a user and issue an access token.
 *
 * Behavior:
 * 1) Loads the user by email via Prisma.
 * 2) Compares the plaintext password with the stored bcrypt hash.
 * 3) Signs a JWT access token with the configured secret and a 15-minute TTL.
 *
 * Token:
 * - Payload: { sub: string(user.id), name: user.username }
 * - Options: { expiresIn: "15m", issuer: "buyinbuyout-api" }
 * - Secret: process.env.JWT_SECRET (must be defined)
 *
 * Throws:
 * - Error(401) for invalid email/password.
 * - Error (no status) if JWT_SECRET is not configured.
 *
 * @param {Object} params
 * @param {string} params.email - User email.
 * @param {string} params.password - Plaintext password.
 * @returns {Promise<{accessToken:string}>} Signed JWT access token.
*/

async function login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const error = new Error("Invalid credentials.");
        error.status = 401;
        throw error;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        const error = new Error("Invalid credentials.");
        error.status = 401;
        throw error;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não configurado no .env");

    const accessToken = jwt.sign(
        { sub: String(user.id), name: user.username },
        secret,
        { expiresIn: "15m", issuer: "buyinbuyout-api" }
    );

    return { accessToken };
}

module.exports = { register, login };
