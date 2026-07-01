const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const {
    placeOrder,
    getMyOrders,
    getSingleOrder
} = require("../controllers/orderController");


// ==========================================
// Place Order
// ==========================================
router.post(
    "/",
    authMiddleware,
    upload.single("measurement_image"),
    placeOrder
);

router.get(
    "/",
    authMiddleware,
    getMyOrders
);

router.get(
    "/:orderId",
    authMiddleware,
    getSingleOrder
);

module.exports = router;