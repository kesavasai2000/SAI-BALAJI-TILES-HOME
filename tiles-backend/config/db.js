// Load environment variables
require("dotenv").config();

// Import Pool class from pg package
const { Pool } = require("pg");

// Create PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Export the pool
module.exports = pool;