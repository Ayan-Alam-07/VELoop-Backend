const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpStore = require("../utils/otpStore");

// 🔹 Generate userId aaa1111a
function generateUserId() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  let id = "";
  for (let i = 0; i < 3; i++)
    id += letters[Math.floor(Math.random() * letters.length)];

  for (let i = 0; i < 4; i++)
    id += numbers[Math.floor(Math.random() * numbers.length)];

  id += letters[Math.floor(Math.random() * letters.length)];

  return id;
}

// 🔹 Generate 8 digit referral code
function generateReferralCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// 🔹 Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔥 SEND OTP TO EMAIL
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    otpStore[email] = {
      code: otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ADSeeN OTP Verification",
      html: `<h2>Your OTP is ${otp}</h2><p>Valid for 5 minutes</p>`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json("OTP sending failed");
  }
});

// 🔥 REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, otp, referralInput } = req.body;

    if (
      !otpStore[email] ||
      otpStore[email].code !== otp ||
      otpStore[email].expires < Date.now()
    ) {
      return res.status(400).json("Invalid or expired OTP");
    }

    const hashed = await bcrypt.hash(password, 10);

    let userId, referralCode;
    let unique = false;

    while (!unique) {
      userId = generateUserId();
      referralCode = generateReferralCode();

      const exist = await User.findOne({
        $or: [{ userId }, { referralCode }],
      });

      if (!exist) unique = true;
    }

    const newUser = new User({
      userId,
      email,
      password: hashed,
      referralCode,
      coins: 0,
    });

    // 🎁 Handle Referral
    if (referralInput) {
      const referrer = await User.findOne({
        referralCode: referralInput,
      });

      if (referrer) {
        referrer.coins += 137;

        referrer.referrals.push({
          userId: userId,
        });

        await referrer.save();
        newUser.referredBy = referrer.userId;
      }
    }

    await newUser.save();

    delete otpStore[email];

    res.json({ message: "Registered Successfully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 🔥 LOGIN (Email + Password)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json("Invalid password");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    token,
    userId: user.userId,
    coins: user.coins,
    referralCode: user.referralCode,
  });
});

module.exports = router;
