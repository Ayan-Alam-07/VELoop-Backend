const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const transactionRoutes = require("./routes/transaction");
const exchangeRoutes = require("./routes/exchange");
const adRoutes = require("./routes/ad");
const captchaRoutes = require("./routes/captchaRoutes");
const dailyBonusRoutes = require("./routes/dailyBonus");
const seedVoucherOptions = require("./config/seedVoucherOptions");

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
  .then(() => console.log("MongoDB Connected"));

await seedVoucherOptions();

app.use("/api/auth", require("./routes/auth"));
app.use("/api/transaction", transactionRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/ad", adRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/daily-bonus", dailyBonusRoutes);

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/withdrawals", require("./routes/withdrawalRoutes"));
app.use("/api/vouchers", require("./routes/voucherRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
