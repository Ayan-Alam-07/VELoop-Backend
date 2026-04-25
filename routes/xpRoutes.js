const express = require("express");
const { addXP } = require("../controllers/xpController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", authMiddleware, addXP);

module.exports = router;
