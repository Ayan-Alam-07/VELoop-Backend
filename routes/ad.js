const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");

const { getAdOffers, watchAd } = require("../controllers/adController");

router.get("/offers", authMiddleware, getAdOffers);

router.post("/watch", authMiddleware, watchAd);

module.exports = router;
