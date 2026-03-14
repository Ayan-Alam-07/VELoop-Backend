const DailyBonus = require("../models/DailyBonus");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.startDailyBonus = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date().toISOString().slice(0, 10);

    const alreadyClaimed = await DailyBonus.findOne({
      userId,
      date: today,
      status: "success",
    });

    if (alreadyClaimed) {
      return res.status(400).json("Daily bonus already claimed");
    }

    const bonus = await DailyBonus.create({
      userId,
      date: today,
      status: "pending",
    });

    res.json({
      taskId: bonus._id,
    });
  } catch (err) {
    res.status(500).json("Failed to start daily bonus");
  }
};

exports.verifyDailyBonus = async (req, res) => {
  try {
    const { taskId, status } = req.body;

    const task = await DailyBonus.findById(taskId);

    if (!task) {
      return res.status(404).json("Task not found");
    }

    if (task.status !== "pending") {
      return res.status(400).json("Task already processed");
    }

    if (status !== "success") {
      task.status = "failed";
      await task.save();
      return res.json("Bonus failed");
    }

    const user = await User.findById(task.userId);

    const reward = 25;

    user.gems += reward;
    await user.save();

    task.status = "success";
    task.reward = reward;

    await task.save();

    await Transaction.create({
      userId: user.userId,
      type: "daily_bonus",
      coins: reward,
      status: "success",
      note: "Daily bonus reward",
    });

    res.json({
      success: true,
      reward,
    });
  } catch (err) {
    res.status(500).json("Verification failed");
  }
};
