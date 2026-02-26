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

    let user = await User.findOne({ email });

    // 🔒 LOCK CHECK
    if (user && user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account locked for 24 hours",
        lockUntil: user.lockUntil,
      });
    }

    // 🚫 BLOCK IF ALREADY REGISTERED
    if (user) {
      return res.status(400).json("User already registered. Please login.");
    }

    // 🔥 RATE LIMIT: Max 3 OTP per 10 minutes
    const now = Date.now();

    if (!user) {
      user = new User({ email }); // temp doc for rate tracking
    }

    if (user.otpRequestWindow && now - user.otpRequestWindow < 10 * 60 * 1000) {
      if (user.otpRequestCount >= 3) {
        return res.status(429).json("Too many OTP requests. Try later.");
      }
      user.otpRequestCount += 1;
    } else {
      user.otpRequestCount = 1;
      user.otpRequestWindow = now;
    }

    await user.save();

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    otpStore[email] = {
      code: otp,
      expires: now + 5 * 60 * 1000,
      attempts: 0,
    };

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "VELOOP Rewards",
          email: process.env.BREVO_SENDER,
        },
        to: [{ email }],
        subject: "VELOOP Rewards OTP Verification",
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
    console.error(error);
    res.status(500).json("OTP failed");
  }
});

// ======================
// 🔥 REGISTER (Email + OTP)
// ======================
router.post("/register", async (req, res) => {
  try {
    const { email, password, otp, referralInput } = req.body;

    // 🔴 Check if already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json("User already registered. Please login.");
    }

    // 🔐 Check OTP validity

    if (!otpStore[email] || otpStore[email].expires < Date.now()) {
      return res.status(400).json("OTP expired");
    }

    if (otpStore[email].code !== otp) {
      otpStore[email].attempts += 1;

      if (otpStore[email].attempts >= 3) {
        await User.updateOne(
          { email },
          {
            $set: {
              lockUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          },
          { upsert: true },
        );

        return res.status(403).json("Account locked for 24 hours");
      }

      return res.status(400).json("Invalid OTP");
    }
    // if (
    //   !otpStore[email] ||
    //   otpStore[email].code !== otp ||
    //   otpStore[email].expires < Date.now()
    // ) {
    //   return res.status(400).json("Invalid or expired OTP");
    // }

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

    // 🎁 Referral logic
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
    console.error(err);
    res.status(500).json("Registration failed");
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

router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json("Email required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json("User not found");
    }

    // 🔒 Account lock check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account locked for 24 hours",
        lockUntil: user.lockUntil,
      });
    }

    const now = Date.now();

    // 🔥 Rate limit: max 3 reset OTP in 10 minutes
    if (user.otpRequestWindow && now - user.otpRequestWindow < 10 * 60 * 1000) {
      if (user.otpRequestCount >= 3) {
        return res.status(429).json("Too many OTP requests. Try later.");
      }
      user.otpRequestCount += 1;
    } else {
      user.otpRequestCount = 1;
      user.otpRequestWindow = now;
    }

    await user.save();

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    otpStore[email] = {
      code: otp,
      expires: now + 5 * 60 * 1000,
      attempts: 0,
      type: "reset",
    };

    // 🔥 Send OTP via Brevo API
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "VELOOP Rewards",
          email: process.env.BREVO_SENDER,
        },
        to: [{ email }],
        subject: "VELOOP Password Reset OTP",
        htmlContent: `
          <h2>Password Reset Request</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    res.json({ message: "Reset OTP sent successfully" });
  } catch (error) {
    console.error("FORGOT OTP ERROR:", error.response?.data || error.message);
    res.status(500).json("Failed to send reset OTP");
  }
});

router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json("User not found");
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json("Account locked for 24 hours");
    }

    if (!otpStore[email] || otpStore[email].expires < Date.now()) {
      return res.status(400).json("OTP expired");
    }

    if (otpStore[email].code !== otp) {
      otpStore[email].attempts += 1;

      if (otpStore[email].attempts >= 3) {
        user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();
        return res
          .status(403)
          .json("Too many wrong attempts. Account locked for 24 hours.");
      }

      return res.status(400).json("Invalid OTP");
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.failedOtpAttempts = 0;
    user.lockUntil = null;

    await user.save();

    delete otpStore[email];

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("RESET ERROR:", error);
    res.status(500).json("Password reset failed");
  }
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
