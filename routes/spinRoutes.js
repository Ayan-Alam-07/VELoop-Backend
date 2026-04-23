// routes/spinRoutes.js

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { getSpinDetails, playSpin } = require("../controllers/spinController");

router.get("/details", authMiddleware, getSpinDetails);
router.post("/play", authMiddleware, playSpin);

module.exports = router;
