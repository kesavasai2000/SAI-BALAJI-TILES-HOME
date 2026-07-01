const validator = require("validator");

const validateSignup = (req, res, next) => {

    const errors = [];

    const fullName = req.body.fullName?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const phoneNo = req.body.phoneNo?.trim();
    const password = req.body.password;

    if (!fullName || fullName.length < 3) {
        errors.push("Full Name must contain at least 3 characters.");
    }

    if (!validator.isEmail(email || "")) {
        errors.push("Please enter a valid email address.");
    }

    if (!validator.isMobilePhone(phoneNo || "", "en-IN")) {
        errors.push("Please enter a valid mobile number.");
    }

    if (
        !validator.isStrongPassword(password || "", {
            minLength: 8,
            minUppercase: 1,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
    ) {
        errors.push(
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
        );
    }

    if (errors.length > 0) {
        const error = new Error("Validation Failed");
error.status = 400;
error.errors = errors;
throw error;
    }

    next();
};

const validateLogin = (req, res, next) => {

    const errors = [];

    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    // Email
    if (!email) {
        errors.push("Email is required.");
    } else if (!validator.isEmail(email)) {
        errors.push("Please enter a valid email address.");
    }

    // Password
    if (!password) {
        errors.push("Password is required.");
    } else if (password.length < 8) {
        errors.push("Password must contain at least 8 characters.");
    }

    if (errors.length > 0) {
        const error = new Error("Validation Failed");
error.status = 400;
error.errors = errors;
throw error;
    }

    next();
};

const validateAddTile = (req, res, next) => {

    const errors = [];

    const {
        tile_name,
        brand,
        category,
        size,
        price,
        stock,
        description
    } = req.body;

    // Image
    if (!req.file) {
        errors.push("Tile image is required.");
    }

    // Tile Name
    if (!tile_name || tile_name.trim().length < 3) {
        errors.push("Tile name must contain at least 3 characters.");
    }

    // Brand
    if (!brand || brand.trim().length === 0) {
        errors.push("Brand is required.");
    }

    // Category
    if (!category || category.trim().length === 0) {
        errors.push("Category is required.");
    }

    // Size
    if (!size || size.trim().length === 0) {
        errors.push("Size is required.");
    }

    // Price
    if (!price) {
        errors.push("Price is required.");
    } else if (isNaN(price) || Number(price) <= 0) {
        errors.push("Price must be greater than 0.");
    }

    // Stock
    if (!stock) {
        errors.push("Stock is required.");
    } else if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
        errors.push("Stock must be a valid positive integer.");
    }

    // Description (Optional)
    if (
        description &&
        description.trim().length > 0 &&
        description.trim().length < 10
    ) {
        errors.push("Description must contain at least 10 characters.");
    }

    if (errors.length > 0) {
        const error = new Error("Validation Failed");
        error.status = 400;
        error.errors = errors;
        throw error;
    }

    next();

};

const validateUpdateTile = (req, res, next) => {

    const {
        tile_name,
        brand,
        category,
        size,
        price,
        stock,
        description
    } = req.body;

    let errors = [];

    // Check if at least one field is provided
    if (
    !tile_name &&
    !brand &&
    !category &&
    !size &&
    !price &&
    !stock &&
    !description &&
    !req.file
) {

    const error = new Error("Validation Failed");

    error.status = 400;

    error.errors = [
        "At least one field is required for update."
    ];

    throw error;
}

    // Tile Name
    if (
        tile_name !== undefined &&
        tile_name.trim().length < 3
    ) {
        errors.push("Tile name must contain at least 3 characters.");
    }

    // Brand
    if (
        brand !== undefined &&
        brand.trim().length < 2
    ) {
        errors.push("Brand name must contain at least 2 characters.");
    }

    // Category
    if (
        category !== undefined &&
        category.trim().length < 3
    ) {
        errors.push("Category must contain at least 3 characters.");
    }

    // Size
    if (
        size !== undefined &&
        size.trim().length === 0
    ) {
        errors.push("Tile size is required.");
    }

    // Price
    if (
        price !== undefined &&
        (isNaN(price) || Number(price) <= 0)
    ) {
        errors.push("Price must be greater than 0.");
    }

    // Stock
    if (
        stock !== undefined &&
        (!Number.isInteger(Number(stock)) || Number(stock) < 0)
    ) {
        errors.push("Stock must be a valid positive integer.");
    }

    // Description
    if (
        description !== undefined &&
        description.trim().length < 10
    ) {
        errors.push("Description must contain at least 10 characters.");
    }

    // Image Validation (Optional)
    if (req.file) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
        ];

        if (!allowedTypes.includes(req.file.mimetype)) {
            errors.push("Only JPG, JPEG, PNG and WEBP images are allowed.");
        }
    }

    if (errors.length > 0) {

    const error = new Error("Validation Failed");

    error.status = 400;

    error.errors = errors;

    throw error;
}

    next();

};

module.exports = {
    validateSignup,
    validateLogin,
    validateAddTile,
    validateUpdateTile
};