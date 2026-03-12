
const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

  getOffers,
  claimExchange

} = require("../controllers/exchangeController");


router.get("/offers", authMiddleware, getOffers);

router.post("/claim", authMiddleware, claimExchange);


module.exports = router;