// import mongoose from "mongoose";

// const dailyCheckinRewardSchema = new mongoose.Schema(
//   {
//     day: {
//       type: Number,
//       required: true,
//       unique: true,
//     },
//     reward: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       enum: ["coin", "giftcard"],
//       required: true,
//     },
//     value: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// export default mongoose.model("DailyCheckinReward", dailyCheckinRewardSchema);

const mongoose = require("mongoose");

const dailyCheckinRewardSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      unique: true,
    },
    reward: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["coin", "giftcard"],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("DailyCheckinReward", dailyCheckinRewardSchema);
