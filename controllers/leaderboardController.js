const User = require("../models/User");

const getLeaderboard = async (req, res) => {
  const users = await User.find()
    .sort({ xp: -1 })
    .limit(10)
    .select("name xp level");

  res.json(users);
};

module.exports = { getLeaderboard };
