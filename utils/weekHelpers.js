function getWeekKey(date) {
  const currentDate = date ? new Date(date) : new Date();
  const year = currentDate.getUTCFullYear();
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const pastDays = Math.floor((currentDate - firstDay) / 86400000);
  const week = Math.ceil((pastDays + firstDay.getUTCDay() + 1) / 7);

  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getRewardByRank(rank, rewardRanges) {
  const matched = rewardRanges.find(
    (item) => rank >= item.start && rank <= item.end,
  );
  return matched ? matched.coins : 0;
}

module.exports = {
  getWeekKey,
  getRewardByRank,
};
