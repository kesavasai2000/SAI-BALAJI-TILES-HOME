const {
    findCartItem,
    addCartItem,
    updateCartQuantity,
    getCartItems,
    updateQuantityByCartId,
    removeCartItem,
    clearCart
} = require("../models/cartModel");


// ==========================================
// Add Item to Cart
// ==========================================
const addToCart = async (req, res, next) => {

    try {

        const userId = req.user.userId;

        const { tile_id, quantity } = req.body;

        // Validate Tile ID
        if (
            tile_id === undefined ||
            tile_id === null ||
            isNaN(Number(tile_id))
        ) {

            const error = new Error("Valid Tile ID is required.");

            error.status = 400;

            throw error;

        }

        // Validate Quantity
        if (
            quantity === undefined ||
            quantity === null ||
            isNaN(Number(quantity)) ||
            Number(quantity) < 1
        ) {

            const error = new Error(
                "Quantity must be a valid number greater than 0."
            );

            error.status = 400;

            throw error;

        }

        const tileId = Number(tile_id);
        const qty = Number(quantity);

        // Check existing cart item
        const existingItem = await findCartItem(
            userId,
            tileId
        );

        // Already exists -> Increase Quantity
        if (existingItem) {

            const updatedItem = await updateCartQuantity(
                existingItem.id,
                existingItem.quantity + qty
            );

            return res.status(200).json({

                success: true,

                message: "Cart updated successfully.",

                cart: updatedItem

            });

        }

        // New Cart Item
        const cartItem = await addCartItem(
            userId,
            tileId,
            qty
        );

        return res.status(201).json({

            success: true,

            message: "Item added to cart.",

            cart: cartItem

        });

    }

    catch (error) {

        next(error);

    }

};



// ==========================================
// View Cart
// ==========================================
const viewCart = async (req, res, next) => {

    try {

        const userId = req.user.userId;

        const cartItems = await getCartItems(userId);

        let totalItems = 0;
        let itemSubtotal = 0;

        cartItems.forEach((item) => {

            totalItems += Number(item.quantity);

            itemSubtotal += Number(item.subtotal);

        });

        return res.status(200).json({

            success: true,

            cart: cartItems,

            summary: {

                totalItems,

                itemSubtotal,

                total: itemSubtotal

            }

        });

    }

    catch (error) {

        next(error);

    }

};



// ==========================================
// Update Cart Quantity
// ==========================================
const updateQuantity = async (req, res, next) => {

    try {

        const { cartId } = req.params;

        const { quantity } = req.body;

        // Validate Cart ID
        if (isNaN(Number(cartId))) {

            const error = new Error("Invalid Cart ID.");

            error.status = 400;

            throw error;

        }

        // Validate Quantity
        if (
            quantity === undefined ||
            quantity === null ||
            isNaN(Number(quantity)) ||
            Number(quantity) < 1
        ) {

            const error = new Error(
                "Quantity must be a valid number greater than 0."
            );

            error.status = 400;

            throw error;

        }

        const userId = req.user.userId;

        const updatedCart = await updateQuantityByCartId(

            Number(cartId),

            Number(quantity),

            userId

        );

        if (!updatedCart) {

            const error = new Error("Cart item not found.");

            error.status = 404;

            throw error;

        }

        return res.status(200).json({

            success: true,

            message: "Cart quantity updated successfully.",

            cart: updatedCart

        });

    }

    catch (error) {

        next(error);

    }

};



// ==========================================
// Remove Cart Item
// ==========================================
const deleteCartItem = async (req, res, next) => {

    try {

        const { cartId } = req.params;

        // Validate Cart ID
        if (isNaN(Number(cartId))) {

            const error = new Error("Invalid Cart ID.");

            error.status = 400;

            throw error;

        }

        const userId = req.user.userId;

        const deletedItem = await removeCartItem(

            Number(cartId),

            userId

        );

        if (!deletedItem) {

            const error = new Error("Cart item not found.");

            error.status = 404;

            throw error;

        }

        return res.status(200).json({

            success: true,

            message: "Item removed from cart successfully."

        });

    }

    catch (error) {

        next(error);

    }

};



// ==========================================
// Clear Cart
// ==========================================
const clearUserCart = async (req, res, next) => {

    try {

        const userId = req.user.userId;

        await clearCart(userId);

        return res.status(200).json({

            success: true,

            message: "Cart cleared successfully."

        });

    }

    catch (error) {

        next(error);

    }

};



module.exports = {

    addToCart,

    viewCart,

    updateQuantity,

    deleteCartItem,

    clearUserCart

};