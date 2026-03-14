const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");
const captchaLimiter = require("../middleware/captchaLimiter");

const {
  getCaptchaTask,
  verifyCaptcha,
} = require("../controllers/captchaController");

router.get("/task", authMiddleware, getCaptchaTask);

router.post("/verify", authMiddleware, captchaLimiter, verifyCaptcha);

module.exports = router;
