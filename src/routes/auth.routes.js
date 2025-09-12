/**
 * Auth Routes
 * Exposes authentication endpoints and binds them to the Auth Controller.
 *
 * Base path: /auth
 * Endpoints:
 * - POST /auth/register
 * - POST /auth/login
*/

const router = require('express').Router()
const ctrl = require('../controllers/auth.controller')

/**
 * POST /auth/register
 * Registers a new user.
 * Body:
 * {
 *   "username": "string",
 *   "email": "string",
 *   "password": "string"
 * }
*/

router.post('/register', ctrl.register)

/**
 * POST /auth/login
 * Authenticates a user and returns an authentication payload.
 * Body:
 * {
 *   "email": "string",
 *   "password": "string"
 * }
*/

router.post('/login', ctrl.login)

module.exports = router
