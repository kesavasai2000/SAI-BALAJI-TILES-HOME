const pool = require("../config/db");

// Check if tile already exists in cart
const findCartItem = async (userId, tileId) => {

    const query = `
        SELECT *
        FROM cart
        WHERE user_id = $1
        AND tile_id = $2;
    `;

    const result = await pool.query(query, [userId, tileId]);

    return result.rows[0];
};

// Add new item into cart
const addCartItem = async (userId, tileId, quantity) => {

    const query = `
        INSERT INTO cart
        (
            user_id,
            tile_id,
            quantity
        )
        VALUES
        ($1,$2,$3)
        RETURNING *;
    `;

    const result = await pool.query(query, [
        userId,
        tileId,
        quantity
    ]);

    return result.rows[0];
};

// Increase quantity if item already exists
const updateCartQuantity = async (id, quantity) => {

    const query = `
        UPDATE cart
        SET quantity = $1
        WHERE id = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [
        quantity,
        id
    ]);

    return result.rows[0];
};

// View Cart
const getCartItems = async (userId) => {

    const query = `
        SELECT

            c.id AS cart_id,

            c.quantity,

            t.id AS tile_id,

            t.tile_name,

            t.brand,

            t.category,

            t.size,

            t.price,

            t.image_url,

            (c.quantity * t.price) AS subtotal

        FROM cart c

        INNER JOIN tiles t

        ON c.tile_id = t.id

        WHERE c.user_id = $1

        ORDER BY c.created_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows;

};
// Clear Cart
const clearCart = async (userId) => {

    const query = `
        DELETE FROM cart
        WHERE user_id = $1;
    `;

    await pool.query(query, [userId]);

};
// Update Quantity by Cart ID
const updateQuantityByCartId = async (
    cartId,
    quantity,
    userId
) => {

    const query = `
        UPDATE cart
        SET quantity = $1
        WHERE id = $2
        AND user_id = $3
        RETURNING *;
    `;

    const result = await pool.query(query, [
    quantity,
    cartId,
    userId
]);

    return result.rows[0];
};

// Remove Cart Item
const removeCartItem = async (
    cartId,
    userId
) => {

    const query = `
        DELETE FROM cart
        WHERE id = $1
        AND user_id = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [
    cartId,
    userId
]);

    return result.rows[0];
};

module.exports = {
    findCartItem,
    addCartItem,
    updateCartQuantity,
    getCartItems,
    updateQuantityByCartId,
    removeCartItem,
    clearCart
};