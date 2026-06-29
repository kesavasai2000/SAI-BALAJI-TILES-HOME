const pool = require("../config/db");

const addTile = async (req, res) => {

    try {

        const {
            tile_name,
            brand,
            category,
            size,
            price,
            stock,
            image_url,
            description
        } = req.body;

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
                description
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *;
        `;

        const values = [
            tile_name,
            brand,
            category,
            size,
            price,
            stock,
            image_url,
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

        console.log(error);

        res.status(500).json({

            success:false,

            message:"Internal Server Error"

        });

    }

};

const getAllTiles = async (req, res) => {
    const {
    page = 1,
    limit = 10,
    search,
    brand,
    category,
    sort
} = req.query;

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
    query += ` tile_name ILIKE $1 $${values.length}`;
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
    countQuery += ` AND tile_name ILIKE ... $${countValues.length}`;
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

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const getTileById = async (req, res) => {

    const { id } = req.params;

    try {

        const query = `
            SELECT * FROM tiles
            WHERE id = $1;
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Tile not found"
            });

        }

        return res.status(200).json({
            success: true,
            tile: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const updateTile = async (req, res) => {

    const { id } = req.params;

    const {
        tile_name,
        brand,
        category,
        size,
        price,
        stock,
        image_url,
        description
    } = req.body;

    try {
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
        description = $8
    WHERE id = $9
    RETURNING *;
`;
const values = [
    tile_name,
    brand,
    category,
    size,
    price,
    stock,
    image_url,
    description,
    id
];
const result = await pool.query(query, values);
if (result.rows.length === 0) {

    return res.status(404).json({
        success: false,
        message: "Tile not found"
    });

}
return res.status(200).json({
    success: true,
    message: "Tile updated successfully",
    tile: result.rows[0]
});

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const deleteTile = async (req, res) => {

    const { id } = req.params;

    try {

        const query = `
            DELETE FROM tiles
            WHERE id = $1
            RETURNING *;
        `;

        const result = await pool.query(query, [id]);

if (result.rows.length === 0) {

    return res.status(404).json({
        success: false,
        message: "Tile not found"
    });

}

return res.status(200).json({
    success: true,
    message: "Tile deleted successfully",
    tile: result.rows[0]
});

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const searchTiles = async (req, res) => {

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

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const filterTiles = async (req, res) => {

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

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const sortTiles = async (req, res) => {

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

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

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