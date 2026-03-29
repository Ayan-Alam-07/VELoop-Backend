const User = require("../models/User");
const VoucherOption = require("../models/VoucherOption");
const Withdrawal = require("../models/Withdrawal");
const Transaction = require("../models/Transaction");

exports.createWithdrawal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json("User not found");
    }

    const { voucherId, payoutType, accountDetails } = req.body;

    const voucher = await VoucherOption.findById(voucherId);

    if (!voucher) {
      return res.status(404).json("Voucher not found");
    }

    if (voucher.payoutType !== payoutType) {
      return res.status(400).json("Invalid payout type");
    }

    if (user.coins < voucher.requiredCoins) {
      return res.status(400).json("Insufficient balance");
    }

    user.coins -= voucher.requiredCoins;
    await user.save();

    const withdrawal = await Withdrawal.create({
      userId: user.userId,
      userMongoId: user._id,
      referralCode: user.referralCode,
      payoutType,
      payoutAmount: voucher.amount,
      deductedCoins: voucher.requiredCoins,
      accountDetails,
      status: "pending",
    });

    await Transaction.create({
      userId: user.userId,
      type: "withdrawal",
      coins: -voucher.requiredCoins,
      status: "pending",
      note: `${payoutType} withdrawal request created`,
    });

    res.json({
      success: true,
      message: "Withdrawal request created",
      withdrawal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Withdrawal failed");
  }
};

exports.getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({
      userMongoId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to fetch withdrawal history");
  }
};
