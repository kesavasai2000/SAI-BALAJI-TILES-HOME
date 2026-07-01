const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const {

    getCartForCheckout,

    createOrder,

    addOrderItem,

    clearCart,

    getClient,
    getUserOrders,
    getOrderDetails

} = require("../models/orderModel");

const placeOrder = async (req, res, next) => {

    let client;

    try {

        const userId = req.user.userId;

        const {
            customer_name,
            phone,
            address
        } = req.body;

        // ----------------------------
        // Validation
        // ----------------------------

        if (!customer_name || customer_name.trim().length < 3) {

            const error = new Error(
                "Customer name is required."
            );

            error.status = 400;

            throw error;

        }

        if (!phone) {

            const error = new Error(
                "Phone number is required."
            );

            error.status = 400;

            throw error;

        }

        if (!address || address.trim().length < 10) {

            const error = new Error(
                "Address must contain at least 10 characters."
            );

            error.status = 400;

            throw error;

        }

        if (!req.file) {

            const error = new Error(
                "Measurement image is required."
            );

            error.status = 400;

            throw error;

        }

        // ----------------------------
        // Read Cart
        // ----------------------------

        const cartItems = await getCartForCheckout(userId);

        if (cartItems.length === 0) {

            const error = new Error(
                "Cart is empty."
            );

            error.status = 400;

            throw error;

        }

        // ----------------------------
        // Calculate Total
        // ----------------------------

        let totalAmount = 0;

        cartItems.forEach(item => {

            totalAmount += Number(item.subtotal);

        });

        // ----------------------------
        // Upload Measurement Image
        // ----------------------------

        const uploadImage = () => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(

            {

                folder: "measurements"

            },

            (error, result) => {

                if (error) {

                    return reject(error);

                }

                resolve({

                    url: result.secure_url,

                    publicId: result.public_id

                });

            }

        );

        streamifier
            .createReadStream(req.file.buffer)
            .pipe(stream);

    });

};

const uploadedImage = await uploadImage();

        // ----------------------------
        // Start Transaction
        // ----------------------------

        client = await getClient();

        await client.query("BEGIN");

        // ----------------------------
        // Create Order
        // ----------------------------

        const order = await createOrder(

            client,

            userId,

            customer_name,

            phone,

            address,

            uploadedImage.url,

            uploadedImage.publicId,

            totalAmount

        );

        // ----------------------------
        // Insert Order Items
        // ----------------------------

        for (const item of cartItems) {

            await addOrderItem(

                client,

                order.id,

                item.tile_id,

                item.quantity,

                item.price,

                item.subtotal

            );

        }

        // ----------------------------
        // Clear Cart
        // ----------------------------

        await clearCart(

            client,

            userId

        );

        // ----------------------------
        // Commit
        // ----------------------------

        await client.query("COMMIT");

        client.release();

        return res.status(201).json({

            success: true,

            message: "Order placed successfully.",

            order

        });

    }

    catch (error) {

        if (client) {

            await client.query("ROLLBACK");

            client.release();

        }

        next(error);

    }

};

// Get Logged-in User Orders
const getMyOrders = async (req, res, next) => {

    try {

        const userId = req.user.userId;

        const orders = await getUserOrders(userId);

        return res.status(200).json({

            success: true,

            orders

        });

    }

    catch (error) {

        next(error);

    }

};

// Get Single Order Details
const getSingleOrder = async (req, res, next) => {

    try {

        const userId = req.user.userId;

        const { orderId } = req.params;

        if (isNaN(Number(orderId))) {

            const error = new Error("Invalid Order ID.");

            error.status = 400;

            throw error;

        }

        const rows = await getOrderDetails(
            orderId,
            userId
        );

        if (rows.length === 0) {

            const error = new Error(
                "Order not found."
            );

            error.status = 404;

            throw error;

        }

        const firstRow = rows[0];

        const order = {

            id: firstRow.id,

            customer_name: firstRow.customer_name,

            phone: firstRow.phone,

            address: firstRow.address,

            measurement_image: firstRow.measurement_image,

            measurement_public_id:
                firstRow.measurement_public_id,

            total_amount: firstRow.total_amount,

            status: firstRow.status,

            created_at: firstRow.created_at,

            items: rows.map(item => ({

                tile_id: item.tile_id,

                tile_name: item.tile_name,

                brand: item.brand,

                category: item.category,

                size: item.size,

                image_url: item.image_url,

                quantity: item.quantity,

                price: item.price,

                subtotal: item.subtotal

            }))

        };

        return res.status(200).json({

            success: true,

            order

        });

    }

    catch (error) {

        next(error);

    }

};

module.exports = {

    placeOrder,

    getMyOrders,

    getSingleOrder


};