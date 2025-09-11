const { prisma } = require('../infra/prisma')

async function listMine({ userId }) {
    return prisma.purchaseRequest.findMany({
        where : { userId },
        orderBy : { createdAt: 'desc' },
        select : {name: true, status: true, createdAt: true}
    })
}

async function getMine({ purchaseRequestId, userId }) {
  	return prisma.purchaseRequest.findFirst({
        where : { id : purchaseRequestId, userId },
        select : {name : true, status : true, createdAt : true, updatedAt : true }
    })
}

async function create({ name, userId }) {
    return prisma.purchaseRequest.create({
        data : { name, user : { connect : { id : userId } } },
        select : {name : true, status : true, createdAt : true}
    })
}

async function updateMine({ purchaseRequestId, userId, name, status }) {
    const result = await prisma.purchaseRequest.update({
        where : { id : purchaseRequestId, userId },
        data : { ...(name && { name }), ...(status && { status }) }
    })

    if (result.count === 0) return null
    return prisma.purchaseRequest.findUnique({
        where : { id : purchaseRequestId },
        select : {name : true, status : true, createdAt : true, updatedAt : true }
    })
}

async function submit({ purchaseRequestId, userId }) {
    const pr = await prisma.purchaseRequest.findFirst({
        where : { id : purchaseRequestId, userId },
        select : { name : true, status: true }
    })
    if (!pr) {
        const error = new Error('Not found'); error.status = 404; throw error
    }
    
    await prisma.purchaseRequest.update({
        where : { id : purchaseRequestId, userId, status : pr.status },
        data : { status: 'SUBMITTED' }
    })

    return prisma.purchaseRequest.findUnique({
        where : { id : purchaseRequestId },
        select : {name : true, status : true, createdAt : true, updatedAt : true }
    })
}

async function approve({ purchaseRequestId, userId }) {
    const user = await prisma.user.findUnique({ where : { id : userId }, select : { role : true } })
    if (!user || user.role !== 'APPROVER') {
        const error = new Error('Forbidden'); 
        error.status = 403; 
        throw error
    }

    const pr = await prisma.purchaseRequest.findUnique({
        where : { id : purchaseRequestId },
        select : { status : true }
    })
    if (!pr) { const error = new Error('Not found'); error.status = 404; throw error }

    const updated = await prisma.purchaseRequest.update({
        where :  { id : purchaseRequestId },
        data : { status : 'APPROVED' },
        select : { id : true, name : true, status : true, createdAt : true, updatedAt : true }
    })

    await prisma.logs.create({
        data: {
            purchaseRequestId : updated.id,
            change : "Purchase request changed to approved"
        }
    })
    return updated
}

async function reject({ purchaseRequestId, userId }) {
    const user = await prisma.user.findUnique({ where: { id : userId }, select : { role : true } })
    if (!user || user.role !== 'APPROVER') {
        const error = new Error('Forbidden'); error.status = 403; throw error
    }

    const pr = await prisma.purchaseRequest.findUnique({
        where : { id : purchaseRequestId },
        select : { status : true }
    })
    if (!pr) { const error = new Error('Not found'); error.status = 404; throw error }


    const updated = await prisma.purchaseRequest.update({
        where : { id : purchaseRequestId },
        data : { status : 'REJECTED' },
        select : { id : true, name : true, status : true, createdAt : true, updatedAt : true }
    })

    await prisma.logs.create({
        data: {
            purchaseRequestId : updated.id,
            change : "Purchase request changed to rejected"
        }
    })

  return updated
}

async function summary() {
    const rows = await prisma.purchaseRequest.groupBy({
        by: ['status'],
        _count: { _all: true }
    })
    return Object.fromEntries(rows.map(r => [r.status, r._count._all]))
}

module.exports = { listMine, getMine, create, updateMine, submit, approve, reject, summary }
