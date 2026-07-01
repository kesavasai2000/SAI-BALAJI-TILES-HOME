const express = require("express");

const router = express.Router();

const {
    addToCart,
    viewCart,
    updateQuantity,
    deleteCartItem,
    clearUserCart
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

// Add to Cart
router.post(
    "/",
    authMiddleware,
    addToCart
);

// View Cart
router.get(
    "/",
    authMiddleware,
    viewCart
);

// Update Cart Quantity
router.put(
    "/:cartId",
    authMiddleware,
    updateQuantity
);

// Remove Cart Item
router.delete(
    "/:cartId",
    authMiddleware,
    deleteCartItem
);

// Clear Cart
router.delete(
    "/",
    authMiddleware,
    clearUserCart
);

module.exports = router;