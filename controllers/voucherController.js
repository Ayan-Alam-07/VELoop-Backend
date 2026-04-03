// const VoucherOption = require("../models/VoucherOption");

// exports.getVoucherOptions = async (req, res) => {
//   try {
//     const { payoutType } = req.params;

//     const vouchers = await VoucherOption.find({
//       payoutType,
//       isActive: true,
//     }).sort({ amount: 1 });

//     res.json(vouchers);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json("Failed to fetch voucher options");
//   }
// };

// controllers/voucherController.js

const VoucherOption = require("../models/VoucherOption");

const getVoucherOptions = async (req, res) => {
  try {
    const { payoutType } = req.params;

    const vouchers = await VoucherOption.find({
      payoutType: payoutType.toLowerCase(),
      isActive: true,
    }).sort({ amount: 1 });

    res.status(200).json(vouchers);
  } catch (error) {
    console.error("Get Voucher Options Error:", error);

    res.status(500).json({
      message: "Failed to fetch voucher options",
    });
  }
};

module.exports = {
  getVoucherOptions,
};
