const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    createUser,
    findUserByEmail
} = require("../models/userModel");

// Test API
const testAuth = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Auth Route Working Successfully"
    });
};

// Signup API
const signup = async (req, res) => {

    try {

        const {
            fullName,
            email,
            phoneNo,
            password
        } = req.body;
        
        // Check Existing User
const existingUser =
    await findUserByEmail(email);

if (existingUser) {

    return res.status(409).json({
        success: false,
        message: "Email already registered."
    });

}

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save User
        const user = await createUser(
    fullName,
    email,
    phoneNo,
    hashedPassword
);

// Remove Password Before Sending Response
const {
    password: removedPassword,
    ...safeUser
} = user;

res.status(201).json({
    success: true,
    message: "User Registered Successfully",
    user: safeUser
});

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// Login API
const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check User
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        // Compare Password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        // Remove Password
        const {
            password: removedPassword,
            ...safeUser
        } = user;

        // Generate JWT
const token = jwt.sign(
    {
        userId: user.id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1h"
    }
);

// Store JWT in HTTP-only Cookie
res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000 // 1 hour
});

res.status(200).json({
    success: true,
    message: "Login Successful",
    user: safeUser
});

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

module.exports = {
    testAuth,
    signup,
    login
};