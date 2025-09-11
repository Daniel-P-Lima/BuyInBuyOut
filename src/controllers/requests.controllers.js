const service = require("../services/requests.service");

async function listMine(req, res) {
    try {
        const output = await service.listMine({ userId: req.userId });
        return res.json(output);
    } catch (error) {
        console.error("LIST_REQUESTS_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

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

async function create(req, res) {
    try {
        const { name, item } = req.body;
        if (!name) return res.status(400).json({ error : "name é obrigatório" });
        const output = await service.create({ name, userId : req.userId, item});
        return res.status(201).json(output);
    } catch (error) {
        console.error("CREATE_REQUEST_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

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

async function summary(_, res) {
    try {
        const output = await service.summary();
        return res.json(output);
    } catch (error) {
        console.error("SUMMARY_ERROR:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

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
