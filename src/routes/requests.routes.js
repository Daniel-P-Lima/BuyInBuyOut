/**
 * Requests Routes
 * Exposes endpoints for managing purchase requests and related actions.
 *
 * Base path: /requests
*/

const router = require("express").Router();
const { authenticateToken } = require("../middlewares/auth");
const ctrl = require("../controllers/requests.controllers");

/**
 * GET /requests/
 * List purchase requests owned by the authenticated user.
 * Auth: Bearer token required.
 */
router.get("/", authenticateToken, ctrl.listMine); 

/**
 * GET /requests/:id
 * Get a single purchase request by ID (owned by the authenticated user).
 * Path params:
 * - id: number (purchase request identifier)
 * Auth: Bearer token required.
 */
router.get("/:id", authenticateToken, ctrl.getMine); 

/**
 * POST /requests/
 * Create a new purchase request.
 * Body:
 * {
 *   "name": "string",
 *   "item": number
 * }
 * Auth: Bearer token required.
 */
router.post("/", authenticateToken, ctrl.create); 

/**
 * PATCH /requests/:id
 * Update fields of a purchase request owned by the authenticated user.
 * Path params:
 * - id: number
 * Body (example):
 * {
 *   "name": "string",
 *   "status": "string|number"
 * }
 * Auth: Bearer token required.
 */
router.patch("/:id", authenticateToken, ctrl.updateMine); 

/**
 * POST /requests/:id/submit
 * Submit a purchase request.
 * Path params:
 * - id: number
 * Auth: Bearer token required.
 */
router.post("/:id/submit", authenticateToken, ctrl.submit);

/**
 * POST /requests/:id/approve
 * Approve a purchase request.
 * Path params:
 * - id: number
 * Auth: Bearer token required.
 */
router.post("/:id/approve", authenticateToken, ctrl.approve);

/**
 * POST /requests/:id/reject
 * Reject a purchase request.
 * Path params:
 * - id: number
 * Auth: Bearer token required.
 */
router.post("/:id/reject", authenticateToken, ctrl.reject);

/**
 * GET /requests/reports/summary
 * Get an aggregated summary of purchase requests.
 * Auth: Bearer token required.
 */
router.get("/reports/summary", authenticateToken, ctrl.summary);

/**
 * POST /requests/createItem
 * Create an item using fields from the request body.
 * Body:
 * {
 *   "itemName": "string",
 *   "itemCost": number
 * }
 * Auth: Bearer token required.
 */
router.post("/createItem", authenticateToken, ctrl.createItem); 

module.exports = router;
