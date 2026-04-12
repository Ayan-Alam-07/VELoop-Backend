const dns = require("node:dns");
// import dns from "node:dns";

// require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const dotenv = require("dotenv");

const transactionRoutes = require("./routes/transaction");
const exchangeRoutes = require("./routes/exchange");
const adRoutes = require("./routes/ad");
const captchaRoutes = require("./routes/captchaRoutes");
const dailyBonusRoutes = require("./routes/dailyBonus");
const seedVoucherOptions = require("./config/seedVoucherOptions");
const seedBonusRewards = require("./config/seedBonusRewards");
const dailyCheckinRoutes = require("./routes/dailyCheckinRoutes");

require("dotenv").config();
// dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://velooprewards.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    await seedVoucherOptions();
    await seedBonusRewards();
  })
  .catch((err) => console.error("MongoDB Error:", err));
// .then(() => console.log("MongoDB Connected"))
// .catch((err) => console.error("MongoDB Error:", err));

// await seedVoucherOptions();
// seedVoucherOptions();

app.use("/api/auth", require("./routes/auth"));
app.use("/api/transaction", transactionRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/ad", adRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/daily-bonus", dailyBonusRoutes);
app.use("/api/bonus", require("./routes/bonusRoutes"));
app.use("/api/daily-checkin", dailyCheckinRoutes);

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/withdrawals", require("./routes/withdrawalRoutes"));
app.use("/api/vouchers", require("./routes/voucherRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));

// import dns from "node:dns";
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";

// import transactionRoutes from "./routes/transaction.js";
// import exchangeRoutes from "./routes/exchange.js";
// import adRoutes from "./routes/ad.js";
// import captchaRoutes from "./routes/captchaRoutes.js";
// import dailyBonusRoutes from "./routes/dailyBonus.js";
// import authRoutes from "./routes/auth.js";
// import bonusRoutes from "./routes/bonusRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import withdrawalRoutes from "./routes/withdrawalRoutes.js";
// import voucherRoutes from "./routes/voucherRoutes.js";
// import dailyCheckinRoutes from "./routes/dailyCheckinRoutes.js";

// import seedVoucherOptions from "./config/seedVoucherOptions.js";
// import seedBonusRewards from "./config/seedBonusRewards.js";

// dotenv.config();

// dns.setServers(["8.8.8.8", "1.1.1.1"]);

// const app = express();

// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://velooprewards.vercel.app"],
//     credentials: true,
//   }),
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(async () => {
//     console.log("MongoDB Connected");

//     try {
//       await seedVoucherOptions();
//       await seedBonusRewards();
//       console.log("Seed data checked successfully");
//     } catch (seedError) {
//       console.error("Seed Error:", seedError);
//     }
//   })
//   .catch((err) => {
//     console.error("MongoDB Error:", err);
//     process.exit(1);
//   });

// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "VELoop Backend Running Successfully",
//   });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/transaction", transactionRoutes);
// app.use("/api/exchange", exchangeRoutes);
// app.use("/api/ad", adRoutes);
// app.use("/api/captcha", captchaRoutes);
// app.use("/api/daily-bonus", dailyBonusRoutes);
// app.use("/api/bonus", bonusRoutes);
// app.use("/api/daily-checkin", dailyCheckinRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/withdrawals", withdrawalRoutes);
// app.use("/api/vouchers", voucherRoutes);

// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });

// app.use((err, req, res, next) => {
//   console.error("Server Error:", err);

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// export default router;
