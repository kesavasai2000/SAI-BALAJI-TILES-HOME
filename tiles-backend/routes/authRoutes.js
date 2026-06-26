const {
    validateSignup
} = require("../middleware/validationMiddleware");
const express = require("express");

const router = express.Router();

const {
    testAuth,
    signup
} = require("../controllers/authController");

// Test API
router.get("/test", testAuth);

// Signup API
router.post(
    "/signup",
    validateSignup,
    signup
);

module.exports = router;