const router = require("express").Router();
const { authenticateToken } = require("../middlewares/auth");
const ctrl = require("../controllers/requests.controllers");

router.get("/", authenticateToken, ctrl.listMine); // List requests
router.get("/:id", authenticateToken, ctrl.getMine); // List one request
router.post("/", authenticateToken, ctrl.create); // Create request
router.patch("/:id", authenticateToken, ctrl.updateMine); // Update request
router.post("/:id/submit", authenticateToken, ctrl.submit); // Submit request
router.post("/:id/approve", authenticateToken, ctrl.approve); // Approve request
router.post("/:id/reject", authenticateToken, ctrl.reject); // Reject request
router.get("/reports/summary", authenticateToken, ctrl.summary); // Sumary requests
router.post("/createItem", authenticateToken, ctrl.createItem) // Create item 

module.exports = router;
