const validator = require("validator");

const validateSignup = (req, res, next) => {

    const {
        fullName,
        email,
        phoneNo,
        password
    } = req.body;

    // Check Name
    if (!fullName || fullName.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "Full Name must contain at least 3 characters."
        });
    }

    // Check Email
    if (!validator.isEmail(email || "")) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }

    // Check Phone Number
    if (!validator.isMobilePhone(phoneNo || "", "en-IN")) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid mobile number."
        });
    }

    // Check Password
    if (!validator.isStrongPassword(password || "", {
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })) {
        return res.status(400).json({
            success: false,
            message:
                "Password must contain 8 characters, uppercase, lowercase, number and special character."
        });
    }

    next();

};

module.exports = {
    validateSignup
};