const router = require("express").Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// ======================
// USER TRANSACTION HISTORY
// ======================

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const transactions = await Transaction.find({
      userId: user.userId,
    }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to fetch transactions");
  }
});

module.exports = router;
