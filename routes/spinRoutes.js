// // routes/spinRoutes.js

// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middleware/authMiddleware");

// const { getSpinDetails, playSpin } = require("../controllers/spinController");

// router.get("/details", authMiddleware, getSpinDetails);
// router.post("/play", authMiddleware, playSpin);

// module.exports = router;

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getSpinDetails,
  playSpin,
  claimSpinReward,
  discardSpinReward,
} = require("../controllers/spinController");

router.get("/details", authMiddleware, getSpinDetails);
router.post("/play", authMiddleware, playSpin);
router.post("/claim", authMiddleware, claimSpinReward);
router.post("/discard", authMiddleware, discardSpinReward);

module.exports = router;
