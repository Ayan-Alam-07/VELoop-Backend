const User = require("../models/User");

function generateUserId() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  let id = "";
  for (let i = 0; i < 3; i++)
    id += letters[Math.floor(Math.random() * letters.length)];

  for (let i = 0; i < 4; i++)
    id += numbers[Math.floor(Math.random() * numbers.length)];

  id += letters[Math.floor(Math.random() * letters.length)];

  return id;
}

function generateReferralCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function generateUniqueIds() {
  let unique = false;
  let userId, referralCode;

  while (!unique) {
    userId = generateUserId();
    referralCode = generateReferralCode();

    const exist = await User.findOne({
      $or: [{ userId }, { referralCode }],
    });

    if (!exist) unique = true;
  }

  return { userId, referralCode };
}

module.exports = generateUniqueIds;
