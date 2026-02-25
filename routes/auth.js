const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const otpStore = require("../utils/otpStore");
const generateUniqueIds = require("../utils/idGenerator");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ======================
// 🔥 SEND OTP
// ======================
const axios = require("axios");

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json("Email required");
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    otpStore[email] = {
      code: otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "VELOOP Rewards",
          email: process.env.BREVO_SENDER,
        },
        to: [{ email }],
        subject: "VELOOP OTP Verification",
        htmlContent: `<h2>Your OTP is ${otp}</h2>`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("BREVO ERROR:", error.response?.data || error.message);
    res
      .status(500)
      .json("OTP sending failed, Try SignIn using Google Or Try after a hour");
  }
});
// ======================
// 🔥 REGISTER (Email + OTP)
// ======================
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

    const { userId, referralCode } = await generateUniqueIds();

    const newUser = new User({
      userId,
      email,
      password: hashed,
      referralCode,
      coins: 0,
      provider: "email",
    });

    // 🎁 Referral
    if (referralInput) {
      const referrer = await User.findOne({
        referralCode: referralInput,
      });

      if (referrer) {
        referrer.coins += 137;
        referrer.referrals.push({ userId });
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

// ======================
// 🔐 LOGIN (Email)
// ======================
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

// ======================
// 🔵 GOOGLE LOGIN
// ======================
router.post("/google-login", async (req, res) => {
  try {
    const { token, referralInput } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    let user = await User.findOne({ email });

    if (!user) {
      const { userId, referralCode } = await generateUniqueIds();

      user = new User({
        userId,
        email,
        password: "google-auth",
        referralCode,
        coins: 0,
        provider: "google",
      });

      if (referralInput) {
        const referrer = await User.findOne({
          referralCode: referralInput,
        });

        if (referrer) {
          referrer.coins += 137;
          referrer.referrals.push({ userId });
          await referrer.save();
          user.referredBy = referrer.userId;
        }
      }

      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token: jwtToken,
      userId: user.userId,
      coins: user.coins,
      referralCode: user.referralCode,
    });
  } catch (err) {
    res.status(400).json("Google login failed");
  }
});

module.exports = router;
