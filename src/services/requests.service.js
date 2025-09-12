/**
 * Requests Service
 * Encapsulates data access and business operations for purchase requests and items.
 *
*/

const { prisma } = require("../infra/prisma");

/**
 * List purchase requests owned by a user, newest first.
 *
 * @param {Object} params
 * @param {number} params.userId - Owner user id
 * @returns {Promise<Array<{name:string,status:string,createdAt:string}>>}
*/

async function listMine({ userId }) {
    return prisma.purchaseRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { name: true, status: true, createdAt: true },
    });
}

/**
 * Get a single purchase request by id, restricted to owner (userId).
 *
 * @param {Object} params
 * @param {number} params.purchaseRequestId - Purchase request id
 * @param {number} params.userId - Owner user id
 * @returns {Promise<{name:string,status:string,createdAt:string,updatedAt:string}|null>}
*/

async function getMine({ purchaseRequestId, userId }) {
    return prisma.purchaseRequest.findFirst({
        where: { id: purchaseRequestId, userId },
        select: { name: true, status: true, createdAt: true, updatedAt: true },
    });
}

/**
 * Create a purchase request for a user and add a single item relation.
 *
 * @param {Object} params
 * @param {string} params.name - Purchase request name
 * @param {number} params.userId - Owner user id
 * @param {number|any} params.item - Item identifier (forwarded as itemId)
 * @returns {Promise<{purchaseRequestCreated:{id:number,name:string,status:string,createdAt:string}, requestItemCreated:any}>}
*/

async function create({ name, userId, item }) {
    const purchaseRequestCreated = await prisma.purchaseRequest.create({
        data: { name, user: { connect: { id: userId } } },
        select: { id: true, name: true, status: true, createdAt: true },
    });

    const requestItemCreated = await prisma.requestItems.create({
        data: { purchaseRequestId: purchaseRequestCreated.id, itemId: item },
    });

    return { purchaseRequestCreated, requestItemCreated };
}

/**
 * Update a purchase request (owned by userId) with provided fields.
 *
 * @param {Object} params
 * @param {number} params.purchaseRequestId - Purchase request id
 * @param {number} params.userId - Owner user id
 * @param {string|undefined} params.name - New name (optional)
 * @param {string|number|undefined} params.status - New status (optional)
 * @returns {Promise<{name:string,status:string,createdAt:string,updatedAt:string}|null>}
 */

async function updateMine({ purchaseRequestId, userId, name, status }) {
    const result = await prisma.purchaseRequest.update({
        where: { id: purchaseRequestId, userId },
        data: { ...(name && { name }), ...(status && { status }) },
    });

    if (result.count === 0) return null;

    return prisma.purchaseRequest.findUnique({
        where: { id: purchaseRequestId },
        select: { name: true, status: true, createdAt: true, updatedAt: true },
    });
}

/**
 * Submit a purchase request (owned by userId), changing status to 'SUBMITTED'.
 *
 * @param {Object} params
 * @param {number} params.purchaseRequestId - Purchase request id
 * @param {number} params.userId - Owner user id
 * @returns {Promise<{name:string,status:string,createdAt:string,updatedAt:string}>}
*/

async function submit({ purchaseRequestId, userId }) {
    const pr = await prisma.purchaseRequest.findFirst({
        where: { id: purchaseRequestId, userId },
        select: { name: true, status: true },
    });
    if (!pr) {
        const error = new Error("Not found");
        error.status = 404;
        throw error;
    }

    await prisma.purchaseRequest.update({
        where: { id: purchaseRequestId, userId, status: pr.status },
        data: { status: "SUBMITTED" },
    });

    return prisma.purchaseRequest.findUnique({
        where: { id: purchaseRequestId },
        select: { name: true, status: true, createdAt: true, updatedAt: true },
    });
}

/**
 * Approve a purchase request. Requires the acting user to have role 'APPROVER'.
 *
 * @param {Object} params
 * @param {number} params.purchaseRequestId - Purchase request id
 * @param {number} params.userId - Acting user id
 * @returns {Promise<{id:number,name:string,status:string,createdAt:string,updatedAt:string}>}
*/

async function approve({ purchaseRequestId, userId }) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    if (!user || user.role !== "APPROVER") {
        const error = new Error("Forbidden");
        error.status = 403;
        throw error;
    }

    const pr = await prisma.purchaseRequest.findUnique({
        where: { id: purchaseRequestId },
        select: { status: true },
    });
    if (!pr) {
        const error = new Error("Not found");
        error.status = 404;
        throw error;
    }

    const updated = await prisma.purchaseRequest.update({
        where: { id: purchaseRequestId },
        data: { status: "APPROVED" },
        select: { id: true, name: true, status: true, createdAt: true, updatedAt: true },
    });

    await prisma.approvalHistory.create({
        data: {
        purchaseRequestId: updated.id,
        change: "Purchase request changed to approved",
        },
    });

    return updated;
}

/**
 * Reject a purchase request. Requires the acting user to have role 'APPROVER'.
 *
 * @param {Object} params
 * @param {number} params.purchaseRequestId - Purchase request id
 * @param {number} params.userId - Acting user id
 * @returns {Promise<{id:number,name:string,status:string,createdAt:string,updatedAt:string}>}
*/

async function reject({ purchaseRequestId, userId }) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    if (!user || user.role !== "APPROVER") {
        const error = new Error("Forbidden");
        error.status = 403;
        throw error;
    }

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
        where: { id: purchaseRequestId },
        select: { status: true },
    });
    if (!purchaseRequest) {
        const error = new Error("Not found");
        error.status = 404;
        throw error;
    }

    const purchaseRequestUpdated = await prisma.purchaseRequest.update({
        where: { id: purchaseRequestId },
        data: { status: "REJECTED" },
        select: { id: true, name: true, status: true, createdAt: true, updatedAt: true },
    });

    await prisma.approvalHistory.create({
        data: {
            purchaseRequestId: purchaseRequestUpdated.id,
            change: "Purchase request changed to rejected",
        },
    });

    return purchaseRequestUpdated;
}

/**
 * Return an aggregated summary of purchase requests grouped by status.
 *
 * Shape:
 * {
 *   "DRAFT": number,
 *   "SUBMITTED": number,
 *   "APPROVED": number,
 *   "REJECTED": number
 * }
 *
 * @returns {Promise<Record<string, number>>}
*/

async function summary() {
    const rows = await prisma.purchaseRequest.groupBy({
        by: ["status"],
        _count: { _all: true },
    });
    return Object.fromEntries(rows.map((r) => [r.status, r._count._all]));
}

/**
 * Create an item with name and cost, returning a projection.
 *
 * @param {string} itemName - Item name
 * @param {number|string} itemCost - Item cost
 * @returns {Promise<{name:string,cost:number|string}>}
*/

async function createItem(itemName, itemCost) {
    return (itemCreated = await prisma.item.create({
        data: {
            name: itemName,
            cost: itemCost,
        },
        select: {
            name: true,
            cost: true,
        },
    }));
}

module.exports = {
    listMine,
    getMine,
    create,
    updateMine,
    submit,
    approve,
    reject,
    summary,
    createItem,
};
