const pool = require("../config/db");

// Create New User
const createUser = async (fullName, email, phoneNo, password, role = "customer") => {

    const query = `
        INSERT INTO users
        (full_name, email, phone_no, password, role)

        VALUES
        ($1, $2, $3, $4, $5)

        RETURNING *;
    `;

    const values = [
        fullName,
        email,
        phoneNo,
        password,
        role
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

// Find User By Email
const findUserByEmail = async (email) => {

    const query = `
        SELECT * FROM users
        WHERE email = $1;
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail
};