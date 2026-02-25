const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const otpStore = require("../utils/otpStore");
const generateUniqueIds = require("../utils/idGenerator");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// 🔹 Brevo Transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// ======================
// 🔥 SEND OTP
// ======================
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  otpStore[email] = {
    code: otp,
    expires: Date.now() + 5 * 60 * 1000,
  };

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "VELOOP OTP Verification",
    html: `<h2>Your OTP is ${otp}</h2><p>Valid for 5 minutes</p>`,
  });

  res.json({ message: "OTP sent" });
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
