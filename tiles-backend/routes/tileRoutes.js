const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const {
    addTile,
    getAllTiles,
    getTileById,
    updateTile,
    deleteTile,
    searchTiles,
    filterTiles,
    sortTiles
} = require("../controllers/tileController");

const authenticateUser = require("../middleware/authMiddleware");

const authorizeRole = require("../middleware/authorizeRole");

const {
    validateAddTile,
    validateUpdateTile
} = require("../middleware/validationMiddleware");

router.post(
    "/",
    authenticateUser,
    authorizeRole("admin"),
    upload.single("image"),
    validateAddTile,
    addTile
);
router.get(
    "/",
    getAllTiles
);

router.get("/search", searchTiles);

router.get("/filter", filterTiles);

router.get("/sort", sortTiles);

router.get(
    "/:id",
    getTileById
);

router.put(
    "/:id",
    authenticateUser,
    authorizeRole("admin"),
    upload.single("image"),
    validateUpdateTile,
    updateTile
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRole("admin"),
    deleteTile
);



module.exports = router;