const authService = require("../services/auth.service");

async function register(req, res) {

    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
        return res
            .status(400)
            .json({ error: 'Username, email and password are required.'});
        }

        const user = await authService.register({ username, email, password });
        return res.status(201).json(user);
    } 
    catch (error) {
        if (error && error.status === 409) {
            return res.status(409).json({ error: error.message });
        }
        console.error("REGISTER_ERROR:", error);
        return res.status(500).json({ error: "Error " });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
        return res
            .status(400)
            .json({ error: 'Email and password are required' });
        }

        const output = await authService.login({ email, password });
        return res.json(output);
    } 
    catch (error) {
        const code = error?.status || 500;
        if (code === 401)
        return res.status(401).json({ error: "Invalid credentials." });
        console.error("LOGIN_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = { register, login };
