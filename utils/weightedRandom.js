// utils/weightedRandom.js

const weightedRandom = (items) => {
  const totalWeight = items.reduce((sum, item) => sum + item.probability, 0);

  let random = Math.random() * totalWeight;

  for (const item of items) {
    if (random < item.probability) {
      return item;
    }

    random -= item.probability;
  }

  return items[0];
};

module.exports = { weightedRandom };
