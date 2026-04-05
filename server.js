// const dns = require("node:dns");

// dns.setServers(["1.1.1.1", "8.8.8.8"]);
require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const transactionRoutes = require("./routes/transaction");
const exchangeRoutes = require("./routes/exchange");
const adRoutes = require("./routes/ad");
const captchaRoutes = require("./routes/captchaRoutes");
const dailyBonusRoutes = require("./routes/dailyBonus");
const seedVoucherOptions = require("./config/seedVoucherOptions");
const seedBonusRewards = require("./config/seedBonusRewards");

require("dotenv").config();

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

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/withdrawals", require("./routes/withdrawalRoutes"));
app.use("/api/vouchers", require("./routes/voucherRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
