const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {

    try {

        // Get Token From Cookie
        const token = req.cookies.token;

        // Check Token Exists
        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Access Denied. Login Required."
            });

        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Save User Information
        req.user = decoded;

        // Continue
        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });

    }

};

module.exports = authenticateUser;