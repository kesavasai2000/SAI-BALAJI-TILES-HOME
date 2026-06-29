const authorizeRole = require("../middleware/authorizeRole");
const authenticateUser = require("../middleware/authMiddleware");
const { getProfile } = require("../controllers/profileController");
const {
    validateSignup
} = require("../middleware/validationMiddleware");
const express = require("express");

const router = express.Router();

const {
    testAuth,
    signup,
    login
} = require("../controllers/authController");

const {
    adminDashboard
} = require("../controllers/adminController");
// Test API
router.get("/test", testAuth);

// Signup API
router.post("/signup", validateSignup, signup);

// Login API
router.post("/login", login);

// Profile API
router.get("/profile", authenticateUser, getProfile);

// Admin Dashboard API
router.get("/admin/dashboard", authenticateUser, authorizeRole("admin"), adminDashboard);

module.exports = router;