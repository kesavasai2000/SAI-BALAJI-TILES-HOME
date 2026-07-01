const pool = require("../config/db");

// Get Cart Items for Checkout
const getCartForCheckout = async (userId) => {

    const query = `
        SELECT

            c.tile_id,

            c.quantity,

            t.tile_name,

            t.price,

            (c.quantity * t.price) AS subtotal

        FROM cart c

        INNER JOIN tiles t

        ON c.tile_id = t.id

        WHERE c.user_id = $1

        ORDER BY c.created_at ASC;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows;

};

// Create Order
const createOrder = async (
    client,
    userId,
    customerName,
    phone,
    address,
    measurementImage,
    measurementPublicId,
    totalAmount
) => {

    const query = `
        INSERT INTO orders
        (
            user_id,
            customer_name,
            phone,
            address,
            measurement_image,
            measurement_public_id,
            total_amount
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *;
    `;

    const result = await client.query(query, [

        userId,

        customerName,

        phone,

        address,

        measurementImage,

        measurementPublicId,

        totalAmount

    ]);

    return result.rows[0];

};

// Insert Order Item
const addOrderItem = async (
    client,
    orderId,
    tileId,
    quantity,
    price,
    subtotal
) => {

    const query = `
        INSERT INTO order_items
        (
            order_id,
            tile_id,
            quantity,
            price,
            subtotal
        )
        VALUES
        ($1,$2,$3,$4,$5)
        RETURNING *;
    `;

    const result = await client.query(query, [

        orderId,

        tileId,

        quantity,

        price,

        subtotal

    ]);

    return result.rows[0];

};

// Clear Cart
const clearCart = async (
    client,
    userId
) => {

    const query = `
        DELETE FROM cart
        WHERE user_id = $1;
    `;

    await client.query(query, [userId]);

};

// Get Database Client (Transaction)
const getClient = async () => {

    return await pool.connect();

};

// Get All Orders of Logged-in User
const getUserOrders = async (userId) => {

    const query = `
        SELECT
            id,
            customer_name,
            phone,
            total_amount,
            status,
            created_at
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows;

};

// Get Order Details
const getOrderDetails = async (orderId, userId) => {

    const query = `
        SELECT

            o.id,
            o.customer_name,
            o.phone,
            o.address,
            o.measurement_image,
            o.measurement_public_id,
            o.total_amount,
            o.status,
            o.created_at,

            oi.tile_id,
            oi.quantity,
            oi.price,
            oi.subtotal,

            t.tile_name,
            t.brand,
            t.category,
            t.size,
            t.image_url

        FROM orders o

        INNER JOIN order_items oi
            ON o.id = oi.order_id

        INNER JOIN tiles t
            ON oi.tile_id = t.id

        WHERE o.id = $1
        AND o.user_id = $2;
    `;

    const result = await pool.query(query, [
        orderId,
        userId
    ]);

    return result.rows;

};

module.exports = {

    getCartForCheckout,

    createOrder,

    addOrderItem,

    clearCart,

    getClient,
    getUserOrders,
    getOrderDetails

};