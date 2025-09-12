/**
 * Authentication middleware
 * Extracts and verifies a Bearer JWT from the Authorization header.
*/


/**
 * Authenticate requests using a Bearer JWT.
 *
 * Expected header:
 *   Authorization: Bearer <token>
 *
 * Responses:
 * - 401 Unauthorized: when the Authorization header is missing or has no token.
 * - 403 Forbidden: when the token is invalid, malformed, or expired.
 *
 * @param {import('express').Request} req - Express request (reads Authorization header)
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next callback
 * @returns {void}
*/
const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
    // Removes the 'Bearer ' prefix and keeps only the token string (if present)
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.sendStatus(401)

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = Number(payload.sub)
        next()
    } 
    catch {
        return res.sendStatus(403)
    }
}

module.exports = { authenticateToken }
