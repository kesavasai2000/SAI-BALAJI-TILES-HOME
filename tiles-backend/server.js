// Load environment variables
require("dotenv").config();

// Import Express
const express = require("express");

// Import Database Pool
const pool = require("./config/db");

// Create Express Application
const app = express();
app.use(express.json());
// Read PORT from .env
const PORT = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
// Test Database Connection
async function connectDatabase() {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("✅ Database Connected Successfully");
        console.log("Database Time:", result.rows[0].now);

    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error.message);
    }
}

// Home Route
app.get("/", (req, res) => {
    res.send("Backend Server is Running 🚀");
});

app.use("/api/auth", authRoutes);
// Start Server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);

    await connectDatabase();
});