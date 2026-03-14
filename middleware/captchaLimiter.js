const rateLimit = require("express-rate-limit");

const captchaLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 1, // 1 request per window
  message: "Too many captcha attempts. Please wait a few seconds.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = captchaLimiter;
