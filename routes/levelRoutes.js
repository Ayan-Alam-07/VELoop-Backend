const express = require("express");
const { getMyLevel } = require("../controllers/levelController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authMiddleware, getMyLevel);

module.exports = router;
