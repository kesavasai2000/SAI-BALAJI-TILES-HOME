const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const addTile = async (req, res, next) => {

    try {
        if (!req.file) {
    const error = new Error("Tile image is required.");
    error.status = 400;
    throw error;
}
const uploadImage = () => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(

            {
                folder: "tiles"
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
const uploadResult = await uploadImage();

const imageUrl = uploadResult.url;
const imagePublicId = uploadResult.publicId;

        const {
            tile_name,
            brand,
            category,
            size,
            price,
            stock,
            description
        } = req.body;
        if (
    !tile_name ||
    !brand ||
    !category ||
    !size ||
    !price ||
    !stock
) {
    const error = new Error("All fields are required.");
    error.status = 400;
    throw error;
}

        const query = `
            INSERT INTO tiles
            (
    tile_name,
    brand,
    category,
    size,
    price,
    stock,
    image_url,
    image_public_id,
    description
)
            VALUES
($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *;
        `;

        const values = [
    tile_name,
    brand,
    category,
    size,
    price,
    stock,
    imageUrl,
    imagePublicId,
    description
];

        const result = await pool.query(query, values);

        res.status(201).json({

            success: true,

            message: "Tile Added Successfully",

            tile: result.rows[0]

        });

    }

    catch(error){

        next(error);

        

    }

};

const getAllTiles = async (req, res, next) => {
    const {
    search,
    brand,
    category,
    sort
} = req.query;

const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;

const offset = (page - 1) * limit;

    try {

        let query = `
SELECT *
FROM tiles
WHERE 1=1
`;

let values = [];

if (search) {
    values.push(`%${search}%`);
    query += ` AND tile_name ILIKE $${values.length}`;
}

if (brand) {
    values.push(brand);
    query += ` AND brand = $${values.length}`;
}

if (category) {
    values.push(category);
    query += ` AND category = $${values.length}`;
}

if (sort === "price_asc") {
    query += " ORDER BY price ASC";
}
else if (sort === "price_desc") {
    query += " ORDER BY price DESC";
}
else if (sort === "newest") {
    query += " ORDER BY created_at DESC";
}
else if (sort === "oldest") {
    query += " ORDER BY created_at ASC";
}
else {
    query += " ORDER BY id";
}
values.push(limit);
query += ` LIMIT $${values.length}`;

values.push(offset);
query += ` OFFSET $${values.length}`;

let countQuery = `
SELECT COUNT(*) 
FROM tiles
WHERE 1=1
`;

let countValues = [];
if (search) {
    countValues.push(`%${search}%`);
    countQuery += ` AND tile_name ILIKE $${countValues.length}`;
}
if (brand) {
    countValues.push(brand);
    countQuery += ` AND brand = $${countValues.length}`;
}
if (category) {
    countValues.push(category);
    countQuery += ` AND category = $${countValues.length}`;
}
        const totalResult = await pool.query(countQuery, countValues);

const totalRecords = parseInt(totalResult.rows[0].count);

const totalPages = Math.ceil(totalRecords / limit);

const result = await pool.query(query, values);
        return res.status(200).json({
    success: true,
    currentPage: Number(page),
    limit: Number(limit),
    totalRecords,
    totalPages,
    count: result.rows.length,
    tiles: result.rows
});

    } catch (error) {

        next(error);

    }

};

const getTileById = async (req, res, next) => {

    const { id } = req.params;

    try {

        const query = `
            SELECT * FROM tiles
            WHERE id = $1;
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
    const error = new Error("Tile not found");
    error.status = 404;
    throw error;
}

        return res.status(200).json({
            success: true,
            tile: result.rows[0]
        });

    } catch (error) {

        next(error);

    }

};

const updateTile = async (req, res, next) => {

    const { id } = req.params;

    try {

        let imageUrl = null;
let imagePublicId = null;

if (req.file) {

            const uploadImage = () => {

                return new Promise((resolve, reject) => {

                    const stream = cloudinary.uploader.upload_stream(

                        {
                            folder: "tiles"
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

            const uploadResult = await uploadImage();

imageUrl = uploadResult.url;
imagePublicId = uploadResult.publicId;

        }

        // If no new image is uploaded, keep the old image
       

const existingTile = await pool.query(
    "SELECT image_url, image_public_id FROM tiles WHERE id = $1",
    [id]
);

if (existingTile.rows.length === 0) {
    const error = new Error("Tile not found");
    error.status = 404;
    throw error;
}

if (!req.file) {

    imageUrl = existingTile.rows[0].image_url;
    imagePublicId = existingTile.rows[0].image_public_id;

} else {

    if (existingTile.rows[0].image_public_id) {

    console.log("Deleting:", existingTile.rows[0].image_public_id);

    const deleteResult = await cloudinary.uploader.destroy(
        existingTile.rows[0].image_public_id
    );

    console.log("Cloudinary Delete Result:", deleteResult);

}

}

        const {
            tile_name,
            brand,
            category,
            size,
            price,
            stock,
            description
        } = req.body;

        const query = `
            UPDATE tiles
            SET
                tile_name = $1,
                brand = $2,
                category = $3,
                size = $4,
                price = $5,
                stock = $6,
                image_url = $7,
image_public_id = $8,
description = $9
WHERE id = $10
            RETURNING *;
        `;

        const values = [
    tile_name,
    brand,
    category,
    size,
    price,
    stock,
    imageUrl,
    imagePublicId,
    description,
    id
];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
    const error = new Error("Tile not found");
    error.status = 404;
    throw error;
}

        return res.status(200).json({
            success: true,
            message: "Tile updated successfully",
            tile: result.rows[0]
        });

    } catch (error) {

        next(error);

    }

};

const deleteTile = async (req, res, next) => {

    const { id } = req.params;

    try {

        const query = `
            DELETE FROM tiles
            WHERE id = $1
            RETURNING *;
        `;

        const result = await pool.query(query, [id]);

if (result.rows.length === 0) {
    const error = new Error("Tile not found");
    error.status = 404;
    throw error;
}

return res.status(200).json({
    success: true,
    message: "Tile deleted successfully",
    tile: result.rows[0]
});

    } catch (error) {

        next(error);

    }

};

const searchTiles = async (req, res, next) => {

    const { search } = req.query;

    try {

        const query = `
            SELECT *
            FROM tiles
            WHERE tile_name ILIKE $1
            ORDER BY id;
        `;

        const result = await pool.query(query, [`%${search}%`]);
        if (result.rows.length === 0) {

    return res.status(200).json({
    success: true,
    count: 0,
    tiles: []
});

}

return res.status(200).json({
    success: true,
    count: result.rows.length,
    tiles: result.rows
});

    } catch (error) {

        next(error);

    }

};

const filterTiles = async (req, res, next) => {

    const { brand, category } = req.query;

    try {

        let query = `
            SELECT *
            FROM tiles
            WHERE 1=1
        `;

        let values = [];

        if (brand) {

            values.push(brand);

            query += ` AND brand = $${values.length}`;

        }

        if (category) {

            values.push(category);

            query += ` AND category = $${values.length}`;

        }

        const result = await pool.query(query, values);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            tiles: result.rows
        });

    } catch (error) {

        next(error);

    }

};

const sortTiles = async (req, res, next) => {

    const { sort } = req.query;

    try {

    let query = `
        SELECT *
        FROM tiles
    `;

    if (sort === "price_asc") {

        query += " ORDER BY price ASC";

    }
    else if (sort === "price_desc") {

        query += " ORDER BY price DESC";

    }
    else if (sort === "newest") {

        query += " ORDER BY created_at DESC";

    }
    else if (sort === "oldest") {

        query += " ORDER BY created_at ASC";

    }

    const result = await pool.query(query);

    return res.status(200).json({
        success: true,
        count: result.rows.length,
        tiles: result.rows
    });

   }
    catch(error){

        next(error);

    }

};

module.exports = {
    addTile,
    getAllTiles,
    getTileById,
    updateTile,
    deleteTile,
    searchTiles,
    filterTiles,
    sortTiles
};