const bcrypt = require("bcrypt");
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

module.exports = {
    testAuth,
    signup
};