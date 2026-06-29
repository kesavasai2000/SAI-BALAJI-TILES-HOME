const express = require("express");

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

router.post(
    "/",
    authenticateUser,
    authorizeRole("admin"),
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
    updateTile
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRole("admin"),
    deleteTile
);



module.exports = router;