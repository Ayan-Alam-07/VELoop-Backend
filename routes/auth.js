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
      return res.status(400).json({ message: "Email required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already registered. Please login.",
      });
    }

    const now = Date.now();

    // Initialize store if not exists
    if (!otpStore[email]) {
      otpStore[email] = {
        count: 0,
        firstRequestTime: now,
      };
    }

    const userOtpData = otpStore[email];

    // 🔥 Reset counter after 1 hour
    if (now - userOtpData.firstRequestTime > 60 * 60 * 1000) {
      userOtpData.count = 0;
      userOtpData.firstRequestTime = now;
    }

    // Block after 3 attempts
    if (userOtpData.count >= 3) {
      return res.status(429).json({
        message: "Too many OTP attempts. Try again later or use Google login.",
      });
    }

    userOtpData.count += 1;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    userOtpData.code = otp;
    userOtpData.expires = now + 5 * 60 * 1000;

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "VELOOP Rewards",
          email: process.env.BREVO_SENDER,
        },
        to: [{ email }],
        subject: "VELOOP Rewards OTP Verification",
        htmlContent: `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
  <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">

    <h2 style="text-align:center; color:#1e88e5; margin-bottom:10px;">
      Welcome to VELOOP Rewards 🎉
    </h2>

    <p style="font-size:15px; color:#444; text-align:center;">
      Verify your email to complete your account registration.
    </p>

    <div style="text-align:center; margin:30px 0;">
      <span style="
        display:inline-block;
        background:#1e88e5;
        color:#ffffff;
        font-size:28px;
        letter-spacing:6px;
        padding:15px 25px;
        border-radius:8px;
        font-weight:bold;
      ">
        ${otp}
      </span>
    </div>

    <p style="font-size:14px; color:#555; text-align:center;">
      This OTP is valid for <strong>5 minutes</strong>.
    </p>

    <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />

    <h4 style="color:#2e7d32;">💰 Refer & Earn</h4>
    <p style="font-size:14px; color:#555;">
      Invite your friends and earn <strong>Upto ₹100</strong> for every successful signup!
      Share your referral code after login and start earning today.
    </p>

    <p style="font-size:12px; color:#888; margin-top:30px; text-align:center;">
      If you didn’t request this, please ignore this email.
    </p>

    <p style="font-size:12px; color:#aaa; text-align:center; margin-top:10px;">
      © ${new Date().getFullYear()} VELOOP Rewards. All rights reserved.
    </p>

  </div>
</div>
`,
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
    res.status(500).json({ message: "OTP failed" });
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
      // 1️⃣ Validate format
      const referralRegex = /^\d{8}$/;

      if (!referralRegex.test(referralInput)) {
        return res.status(400).json({
          message: "Invalid referral code format",
        });
      }

      const referrer = await User.findOne({
        referralCode: referralInput,
      });

      // 2️⃣ Check existence
      if (!referrer) {
        return res.status(400).json({
          message: "Referral code does not exist",
        });
      }

      // 3️⃣ Prevent self-referral
      if (referrer.email === email) {
        return res.status(400).json({
          message: "You cannot use your own referral code",
        });
      }

      // 4️⃣ Prevent duplicate referral
      const alreadyReferred = referrer.referrals.some(
        (r) => r.userId === userId,
      );

      if (alreadyReferred) {
        return res.status(400).json({
          message: "Referral already applied",
        });
      }

      // 5️⃣ Apply reward
      referrer.coins += 137;

      referrer.referrals.push({
        userId,
        email,
        date: new Date(),
      });

      await referrer.save();

      newUser.referredBy = referrer.userId;
    }

    await newUser.save();
    delete otpStore[email];

    res.json({ message: "Registered Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
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
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
  <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">

    <h2 style="text-align:center; color:#e53935; margin-bottom:10px;">
      Password Reset Request 🔐
    </h2>

    <p style="font-size:15px; color:#444; text-align:center;">
      Use the OTP below to reset your password.
    </p>

    <div style="text-align:center; margin:30px 0;">
      <span style="
        display:inline-block;
        background:#e53935;
        color:#ffffff;
        font-size:28px;
        letter-spacing:6px;
        padding:15px 25px;
        border-radius:8px;
        font-weight:bold;
      ">
        ${otp}
      </span>
    </div>

    <p style="font-size:14px; color:#555; text-align:center;">
      This OTP will expire in <strong>5 minutes</strong>.
    </p>

    <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />

    <h4 style="color:#2e7d32;">💰 Still earning?</h4>
    <p style="font-size:14px; color:#555;">
      Don’t forget — you earn <strong>₹100</strong> for every friend you refer.
      Log back in and keep growing your rewards!
    </p>

    <p style="font-size:12px; color:#888; margin-top:30px; text-align:center;">
      If you didn’t request a password reset, you can safely ignore this email.
    </p>

    <p style="font-size:12px; color:#aaa; text-align:center; margin-top:10px;">
      © ${new Date().getFullYear()} VELOOP Rewards. All rights reserved.
    </p>

  </div>
</div>
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
        // 1️⃣ Validate format
        const referralRegex = /^\d{8}$/;

        if (!referralRegex.test(referralInput)) {
          return res.status(400).json({
            message: "Invalid referral code format",
          });
        }

        const referrer = await User.findOne({
          referralCode: referralInput,
        });

        // 2️⃣ Check existence
        if (!referrer) {
          return res.status(400).json({
            message: "Referral code does not exist",
          });
        }

        // 3️⃣ Prevent self-referral
        if (referrer.email === email) {
          return res.status(400).json({
            message: "You cannot use your own referral code",
          });
        }

        // 4️⃣ Prevent duplicate referral
        const alreadyReferred = referrer.referrals.some(
          (r) => r.userId === userId,
        );

        if (alreadyReferred) {
          return res.status(400).json({
            message: "Referral already applied",
          });
        }

        // 5️⃣ Apply reward
        referrer.coins += 137;

        referrer.referrals.push({
          userId,
          email,
          date: new Date(),
        });

        await referrer.save();

        newUser.referredBy = referrer.userId;
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
