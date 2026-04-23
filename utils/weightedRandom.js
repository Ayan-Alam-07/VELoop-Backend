// const weightedRandom = (rewards) => {
//   const totalWeight = rewards.reduce(
//     (sum, reward) => sum + reward.probability,
//     0,
//   );

//   let random = Math.random() * totalWeight;

//   for (const reward of rewards) {
//     random -= reward.probability;

//     if (random <= 0) {
//       return reward;
//     }
//   }

//   return rewards[0];
// };

// module.exports = weightedRandom;

const weightedRandom = (items) => {
  if (!items || items.length === 0) return null;

  const validItems = items.filter(
    (item) => typeof item.probability === "number" && item.probability > 0,
  );

  if (!validItems.length) return items[0];

  const totalWeight = validItems.reduce(
    (sum, item) => sum + item.probability,
    0,
  );

  let random = Math.random() * totalWeight;

  for (const item of validItems) {
    if (random < item.probability) {
      return item;
    }
    random -= item.probability;
  }

  return validItems[0];
};

module.exports = weightedRandom;
