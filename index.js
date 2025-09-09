require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('./generated/prisma')

const app = express()
const prisma = new PrismaClient()
app.use(express.json())


app.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are obri" });
    }

    const exists = await prisma.users.findFirst({
      where:  { username } ,
    });

    if (exists)
    return res.status(409).json({ error: "E-mail already in use" });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.users.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('REGISTER_ERROR:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email e password são obrigatórios' })

    const user = await prisma.users.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })

    const accessToken = jwt.sign(
      { sub: String(user.id), name: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    return res.json({ accessToken })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (token == null) return res.sendStatus(401); // sem token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // token inválido
    req.user = user;
    next();
  });
}

app.post("/requests", async (req, res) => {
    try {
        const { name } = req.body

        const request = await prisma.requests.create({
            data: {name},
            select: {id: true, status: true, createdAt: true, updatedAt: true, name: true}
        })

        return res.status(201).json(request)

    } catch (error) {
        console.error('REGISTER_ERROR:', error)
        return res.status(500).json({ error: 'Erro interno' })
    }
})

app.listen(3000);
