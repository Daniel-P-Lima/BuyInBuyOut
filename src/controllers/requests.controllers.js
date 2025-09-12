/**
 * Requests Controller
 * Handles HTTP endpoints related to purchase requests and items.
*/

const service = require("../services/requests.service");


/**
 * List all purchase requests that belong to the authenticated user.
 *
 * Route: GET /requests
 *
 * Responses:
 * - 200 OK: Returns an array of the user's purchase requests.
 * - 500 Internal Server Error: Unexpected error.
 *
 * @param {import('express').Request} req - Express request (expects req.userId)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
*/

async function listMine(req, res) {
    try {
        const output = await service.listMine({ userId: req.userId });
        return res.json(output);
    } catch (error) {
        console.error("LIST_REQUESTS_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}


/**
 * Get a specific purchase request owned by the authenticated user.
 *
 * Route: GET /requests/:id
 *
 * Path params:
 * - id: number (purchase request id)
 *
 * Responses:
 * - 200 OK: Returns the purchase request data.
 * - 404 Not Found: Purchase request not found or not owned by the user.
 * - 500 Internal Server Error: Unexpected error.
 *
 * @param {import('express').Request} req - Express request (expects req.params.id, req.userId)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
*/

async function getMine(req, res) {
    try {
        const purchaseRequestId = Number(req.params.id);
        const output = await service.getMine({ purchaseRequestId, userId : req.userId });
        if (!output)
        return res.sendStatus(404).json({ error: "Purchase request not found." });
        return res.json(output);
    } 
    catch (error) {
        console.error("GET_REQUEST_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

/**
 * Create a new purchase request for the authenticated user.
 *
 * Route: POST /requests
 *
 * Expected body:
 * {
 *   "name": "string",
 *   "item": number
 * }
 *
 * Responses:
 * - 201 Created: Returns the created purchase request.
 * - 400 Bad Request: Missing "name".
 * - 500 Internal Server Error: Unexpected error.
 *
 * @param {import('express').Request} req - Express request (expects req.userId)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
*/

async function create(req, res) {
    try {
        const { name, item } = req.body;
        if (!name) return res.status(400).json({ error : "Missing name" });
        const output = await service.create({ name, userId : req.userId, item});
        return res.status(201).json(output);
    } catch (error) {
        console.error("CREATE_REQUEST_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}


/**
 * Update a purchase request owned by the authenticated user.
 *
 * Route: PATCH /requests/:id
 *
 * Path params:
 * - id: number (purchase request id)
 *
 * Expected body:
 * {
 *   "name": "string",
 *   "status": "string"
 * }
 *
 * Responses:
 * - 200 OK: Returns the updated purchase request.
 * - 404 Not Found: Purchase request not found or not owned by the user.
 * - 500 Internal Server Error: Unexpected error.
 *
 * @param {import('express').Request} req - Express request (expects req.params.id, req.userId)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
*/

async function updateMine(req, res) {
    try {
        const purchaseRequestId = Number(req.params.id);
        const { name, status } = req.body;
        const output = await service.updateMine({ purchaseRequestId, userId : req.userId, name, status});
        if (!output) return res.sendStatus(404);
        return res.json(output);
    } catch (error) {
        console.error("UPDATE_REQUEST_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

/**
 * Submit a purchase request for further processing (owned by the user).
 *
 * Route: POST /requests/:id/submit
 *
 * Path params:
 * - id: number (purchase request id)
 *
 * Responses:
 * - 200 OK: Returns the updated request (e.g., with new status).
 * - {error.status} Custom error: If service throws with a specific status code,
 *   it is forwarded directly as response status and message.
 * - 500 Internal Server Error: Unexpected error.
 *
 * @param {import('express').Request} req - Express request (expects req.params.id, req.userId)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
*/

async function submit(req, res) {
    try {
        const purchaseRequestId = Number(req.params.id);
        const output = await service.submit({ purchaseRequestId, userId : req.userId });
        return res.json(output);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        console.error("STATUS_UPDATE_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

/**
 * Approve a purchase request.
 *
 * Route: POST /requests/:id/approve
 *
 * Path params:
 * - id: number (purchase request id)
 *
 * Responses:
 * - 200 OK: Returns the updated/approved request.
 * - {error.status} Custom error: If service throws with a specific status code,
 *   it is forwarded directly as response status and message.
 * - 500 Internal Server Error: Unexpected error.
 *
 * @param {import('express').Request} req - Express request (expects req.params.id, req.userId)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
*/

async function approve(req, res) {
    try {
        const purchaseRequestId = Number(req.params.id);
        const output = await service.approve({ purchaseRequestId, userId : req.userId });
        return res.json(output);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error : error.message });
        console.error("APPROVE_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

/**
 * Reject a purchase request (authorization rules enforced by the service).
 *
 * Route: POST /requests/:id/reject
 *
 * Path params:
 * - id: number (purchase request id)
 *
 * Responses:
 * - 200 OK: Returns the updated/rejected request.
 * - {error.status} Custom error: If service throws with a specific status code,
 *   it is forwarded directly as response status and message.
 * - 500 Internal Server Error: Unexpected error.
 *
 * @param {import('express').Request} req - Express request (expects req.params.id, req.userId)
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
*/

async function reject(req, res) {
    try {
        const purchaseRequestId = Number(req.params.id);
        const output = await service.reject({ purchaseRequestId, userId : req.userId });
        return res.json(output);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error : error.message });
        console.error("REJECT_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

/**
 * Get a global summary of purchase requests.
 *
 * Route: GET /reports/summary
 *
 * Responses:
 * - 200 OK: Returns an aggregated summary (structure defined by the service).
 * - 500 Internal Server Error: Unexpected error.
 *
 * @param {import('express').Request} _ - Unused request parameter
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
*/

async function summary(_, res) {
    try {
        const output = await service.summary();
        return res.json(output);
    } catch (error) {
        console.error("SUMMARY_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

/**
 * Create an item (e.g., catalog entry) using raw fields from the request body.
 *
 * Route: POST /items
 *
 * Expected body:
 * {
 *   "itemName": "string",
 *   "itemCost": number | string
 * }
 *
 * Responses:
 * - 200 OK: Returns the created item (shape defined by the service).
 * - 500 Internal Server Error: Unexpected error.
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
*/

async function createItem(req, res) {
    try {
        const {itemName, itemCost} = req.body
        const output = await service.createItem(itemName, itemCost)
        return res.json(output)
    } catch (error) {
        console.error("UPDATE_REQUEST_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
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
  createItem
};
