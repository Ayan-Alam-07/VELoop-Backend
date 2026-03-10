const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getExchangeCards,
  claimExchange,
} = require("../controllers/exchangeController");

router.get("/cards", authMiddleware, getExchangeCards);

router.post("/claim", authMiddleware, claimExchange);

module.exports = router;
