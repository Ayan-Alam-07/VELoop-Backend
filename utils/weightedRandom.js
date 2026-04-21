const weightedRandom = (rewards) => {
  const totalWeight = rewards.reduce(
    (sum, reward) => sum + reward.probability,
    0,
  );

  let random = Math.random() * totalWeight;

  for (const reward of rewards) {
    random -= reward.probability;

    if (random <= 0) {
      return reward;
    }
  }

  return rewards[0];
};

module.exports = weightedRandom;
