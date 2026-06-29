const authorizeRole = (...allowedRoles) => {

    return (req, res, next) => {

        // Check User Role
        if (!allowedRoles.includes(req.user.role)) {

            return res.status(403).json({

                success: false,

                message: "Access Forbidden"

            });

        }

        next();

    };

};

module.exports = authorizeRole;