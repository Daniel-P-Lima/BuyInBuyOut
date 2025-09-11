const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../infra/prisma");

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
