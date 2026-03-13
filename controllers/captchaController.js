const User = require("../models/User");
const Transaction = require("../models/Transaction");
const CaptchaTask = require("../models/CaptchaTask");

function replaceDigits(str, replacements) {
  let chars = str.split("");

  replacements.forEach(([index, newDigit]) => {
    chars[index] = newDigit;
  });

  return chars.join("");
}

const generateCaptchaOptions = () => {
  const captcha = Math.floor(100000 + Math.random() * 900000);

  const firstNum = captcha.toString()[0];
  const secNum = captcha.toString()[1];
  const lastNum = captcha.toString()[5];

  let captcha2 = Math.floor(100000 + Math.random() * 990000);
  let captcha2Str = replaceDigits(captcha2.toString(), [
    [0, firstNum],
    [1, secNum],
    [5, lastNum],
  ]);

  let captcha3 = Math.floor(100000 + Math.random() * 890000);
  let captcha3Str = replaceDigits(captcha3.toString(), [
    [0, firstNum],
    [1, secNum],
    [5, lastNum],
  ]);

  const captcha4 = Math.floor(100000 + Math.random() * 790000);

  const options = [
    { id: 1, value: captcha },
    { id: 2, value: parseInt(captcha2Str) },
    { id: 3, value: parseInt(captcha3Str) },
    { id: 4, value: captcha4 },
  ].sort(() => Math.random() - 0.5);

  return {
    captcha,
    options,
  };
};

exports.getCaptchaTask = async (req, res) => {
  try {
    const userId = req.user.id;

    const { captcha, options } = generateCaptchaOptions();

    const task = await CaptchaTask.create({
      userId,
      captcha,
      options: options.map((o) => o.value),
      correctOption: captcha,
    });

    res.json({
      taskId: task._id,
      captcha,
      options: options.map((o) => o.value),
    });
  } catch (err) {
    res.status(500).json("Failed to generate captcha");
  }
};

// exports.verifyCaptcha = async (req, res) => {
//   try {
//     const { taskId, selected } = req.body;

//     const task = await CaptchaTask.findById(taskId);

//     if (!task) {
//       return res.status(404).json("Captcha expired");
//     }

//     const user = await User.findById(req.user.id);

//     const correct = selected === task.correctOption;

//     const reward = correct ? 1 : 0.75;

//     user.gems += reward;

//     await user.save();

//     await Transaction.create({
//       userId: user.userId,
//       type: "captcha_task",
//       coins: reward,
//       status: "success",
//       note: correct ? "Captcha correct" : "Captcha wrong",
//     });

//     await CaptchaTask.findByIdAndDelete(taskId);

//     res.json({
//       result: correct,
//       reward,
//     });
//   } catch (err) {
//     res.status(500).json("Captcha verification failed");
//   }
// };

exports.verifyCaptcha = async (req, res) => {
  try {
    const { taskId, selected } = req.body;

    if (!taskId || !selected) {
      return res.status(400).json("Invalid captcha request");
    }

    const task = await CaptchaTask.findById(taskId);

    if (!task) {
      return res.status(404).json("Captcha expired");
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json("User not found");
    }

    // convert to number to avoid type mismatch
    const selectedNumber = Number(selected);

    const correct = selectedNumber === task.correctOption;

    const reward = correct ? 1 : 0.75;

    // ensure gems exists
    if (!user.gems) {
      user.gems = 0;
    }

    user.gems += reward;

    await user.save();

    await Transaction.create({
      userId: user.userId,
      type: "captcha",
      coins: reward,
      status: "success",
      note: correct ? "Captcha correct" : "Captcha wrong",
    });

    // remove captcha task
    await CaptchaTask.findByIdAndDelete(taskId);

    res.json({
      result: correct,
      reward,
    });
  } catch (error) {
    console.error("CAPTCHA VERIFY ERROR:", error);

    res.status(500).json("Captcha verification failed");
  }
};
