const VoucherOption = require("../models/VoucherOption");

exports.getVoucherOptions = async (req, res) => {
  try {
    const { payoutType } = req.params;

    const vouchers = await VoucherOption.find({
      payoutType,
      isActive: true,
    }).sort({ amount: 1 });

    res.json(vouchers);
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to fetch voucher options");
  }
};
