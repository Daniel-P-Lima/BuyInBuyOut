const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1] // Remove o 'Bearer' da string 
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
