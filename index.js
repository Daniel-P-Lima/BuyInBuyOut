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

    const exists = await prisma.user.findFirst({
      where:  { username } ,
    });

    if (exists)
    return res.status(409).json({ error: "E-mail is already in use" });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('REGISTER_ERROR:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email e password são obrigatórios' })

    const user = await prisma.user.findUnique({ where: { email } })
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
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403)
    req.userId = Number(payload.sub)
    next()
  })
}


app.get('/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await prisma.purchaseRequest.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, status: true, createdAt: true, updatedAt: true }
    })
    return res.json(requests)
  } catch (error) {
    console.error('LIST_REQUESTS_ERROR:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
})


app.get('/requests/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const request = await prisma.purchaseRequest.findFirst({
      where: { id, userId: req.userId },
      select: { id: true, name: true, status: true, createdAt: true, updatedAt: true }
    })
    if (!request) return res.sendStatus(404)
    return res.json(request)
  } catch (error) {
    console.error('GET_REQUEST_ERROR:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
})


app.post('/requests', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'name é obrigatório' })

    const request = await prisma.purchaseRequest.create({
      data: {
        name,
        user: { connect: { id: req.userId } } // vincula ao dono
      },
      select: { id: true, name: true, status: true, createdAt: true, updatedAt: true }
    })

    return res.status(201).json(request)
  } catch (error) {
    console.error('CREATE_REQUEST_ERROR:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

app.patch('/requests/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { name, status } = req.body

    const result = await prisma.purchaseRequest.updateMany({
      where: { id, userId: req.userId },
      data: { ...(name && { name }), ...(status && { status }) }
    })

    if (result.count === 0) return res.sendStatus(404)

    const updated = await prisma.purchaseRequest.findUnique({
      where: { id },
      select: { id: true, name: true, status: true, createdAt: true, updatedAt: true }
    })

    return res.json(updated)
  } catch (error) {
    console.error('UPDATE_REQUEST_ERROR:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

app.post('/requests/:id/submit', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id)

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { 
        id, 
        userId: req.userId 
      },
      select: { 
        status: true
      }
    })

    if (!purchaseRequest) return res.sendStatus(404)

    const updated = await prisma.purchaseRequest.update({
        where: { id },
        data: { status: "SUBMITTED" },
        select: { name: true, status: true}
      })
      return res.json(updated)
  } catch (error) {
    console.error('STATUS_UPDATE_ERROR:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
})

app.post('/requests/:id/approve', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id : req.userId
    }
  })
  if (user.role != 'APPROVER') return res.sendStatus(403)

  const purchaseRequest = await prisma.purchaseRequest.findUnique({
    where: {
      id: Number(req.params.id)
    }
  })

  if (!purchaseRequest) return res.sendStatus(404)
  
  const purchaseRequestUpdated = await prisma.purchaseRequest.update({
    where: {
      id: purchaseRequest.id
    },
    data: {
      status : 'APPROVED'
    },
    select: {
      name: true, status: true
    }
  })

  const purchaseRequestLog = await prisma.logs.create({
    data : {
      purchaseRequestId :  purchaseRequest.id,
      change : "Request change to approved"
    }
  })

  return res.sendStatus(200).json(purchaseRequestUpdated) 
})

app.post('/requests/:id/reject', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where : {
      id : req.userId
    }
  })

  if (user.role != 'APPROVER') return res.sendStatus(403)
  
  const purchaseRequest = await prisma.purchaseRequest.findUnique({
    where: {
      id : Number(req.params.id)
    }
  })

  if (!purchaseRequest) return res.sendStatus(404)
  
  const purchaseRequestUpdated = await prisma.purchaseRequest.update({
    where : {
      id : purchaseRequest.id
    },
    data : {
      status : 'REJECTED'
    },
    select : {
      name : true, status : true
    }
  })

  const purchaseRequestLog = await prisma.logs.create({
    data : {
      purchaseRequestId :  purchaseRequest.id,
      change : "Request change to rejected"
    }
  })

  return res.sendStatus(200).json(purchaseRequestUpdated)
})


app.listen(3000);
