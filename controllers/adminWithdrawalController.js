// const User = require("../models/User");
// const Withdrawal = require("../models/Withdrawal");
// const Transaction = require("../models/Transaction");

// exports.getAllWithdrawals = async (req, res) => {
//   try {
//     const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });

//     res.json(withdrawals);
//   } catch (error) {
//     res.status(500).json("Failed to fetch withdrawals");
//   }
// };

// exports.markWithdrawalPaid = async (req, res) => {
//   try {
//     const withdrawal = await Withdrawal.findById(req.params.id);

//     if (!withdrawal) {
//       return res.status(404).json("Withdrawal not found");
//     }

//     if (withdrawal.status !== "pending") {
//       return res
//         .status(400)
//         .json("Only pending withdrawals can be marked paid");
//     }

//     withdrawal.status = "paid";
//     withdrawal.paidAt = new Date();

//     await withdrawal.save();

//     res.json("Withdrawal marked as paid");
//   } catch (error) {
//     res.status(500).json("Failed to update withdrawal");
//   }
// };

// exports.rejectWithdrawal = async (req, res) => {
//   try {
//     const withdrawal = await Withdrawal.findById(req.params.id);

//     if (!withdrawal) {
//       return res.status(404).json("Withdrawal not found");
//     }

//     if (withdrawal.status !== "pending") {
//       return res.status(400).json("Only pending withdrawals can be rejected");
//     }

//     const user = await User.findById(withdrawal.userMongoId);

//     if (!user) {
//       return res.status(404).json("User not found");
//     }

//     user.coins += withdrawal.deductedCoins;
//     await user.save();

//     withdrawal.status = "rejected";
//     withdrawal.rejectedAt = new Date();

//     await withdrawal.save();

//     await Transaction.create({
//       userId: user.userId,
//       type: "withdrawal_refund",
//       coins: withdrawal.deductedCoins,
//       status: "success",
//       note: "Withdrawal rejected and refunded",
//     });

//     res.json("Withdrawal rejected and refunded");
//   } catch (error) {
//     console.error(error);
//     res.status(500).json("Failed to reject withdrawal");
//   }
// };

const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to fetch withdrawals");
  }
};

exports.markWithdrawalPaid = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json("Withdrawal not found");
    }

    if (withdrawal.status === "paid") {
      return res.status(400).json("Withdrawal already marked as paid");
    }

    if (withdrawal.status === "rejected") {
      return res.status(400).json("Rejected withdrawal cannot be marked paid");
    }

    withdrawal.status = "paid";
    withdrawal.paidAt = new Date();

    await withdrawal.save();

    const user = await User.findById(withdrawal.userMongoId);

    if (user) {
      user.totalWithdrawCount += 1;
      user.totalWithdrawAmount += withdrawal.payoutAmount;

      await user.save();
    }

    await Transaction.create({
      userId: withdrawal.userId,
      type: "withdrawal_paid",
      coins: 0,
      status: "success",
      note: `${withdrawal.payoutType} withdrawal paid`,
    });

    res.json("Withdrawal marked as paid");
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to update withdrawal");
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json("Withdrawal not found");
    }

    if (withdrawal.status === "rejected") {
      return res.status(400).json("Withdrawal already rejected");
    }

    if (withdrawal.status === "paid") {
      return res.status(400).json("Paid withdrawal cannot be rejected");
    }

    const user = await User.findById(withdrawal.userMongoId);

    if (!user) {
      return res.status(404).json("User not found");
    }

    user.coins += withdrawal.deductedCoins;

    await user.save();

    withdrawal.status = "rejected";
    withdrawal.rejectedAt = new Date();

    await withdrawal.save();

    await Transaction.create({
      userId: user.userId,
      type: "withdrawal_refund",
      coins: withdrawal.deductedCoins,
      status: "success",
      note: "Withdrawal rejected and refunded",
    });

    res.json("Withdrawal rejected and refunded");
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to reject withdrawal");
  }
};
