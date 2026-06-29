const adminDashboard = (req, res) => {

    res.status(200).json({

        success: true,

        message: "Welcome Admin!",

        user: req.user

    });

};

module.exports = {
    adminDashboard
};