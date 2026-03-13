const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const withdrawalRoutes = require("./routes/withdrawal");
const adminRoutes = require("./routes/admin");
const adRoutes = require("./routes/ad");
const transactionRoutes = require("./routes/transaction");
const exchangeRoutes = require("./routes/exchange");
const adRoutes = require("./routes/ad");

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

app.use("/api/auth", require("./routes/auth"));
app.use("/api/withdrawal", withdrawalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ad", adRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/ad", adRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
