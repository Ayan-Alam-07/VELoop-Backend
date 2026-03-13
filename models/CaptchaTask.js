const mongoose = require("mongoose");

const captchaTaskSchema = new mongoose.Schema({
  userId: String,

  captcha: Number,

  options: [Number],

  correctOption: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CaptchaTask", captchaTaskSchema);
