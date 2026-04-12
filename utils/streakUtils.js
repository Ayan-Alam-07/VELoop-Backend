export const getCurrentStreakDay = (lastClaimedDate, currentStreak) => {
  if (!lastClaimedDate) return 1;

  const lastDate = new Date(lastClaimedDate);
  const today = new Date();

  lastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today - lastDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays === 0) {
    return currentStreak;
  }

  if (diffDays === 1) {
    return currentStreak >= 7 ? 1 : currentStreak + 1;
  }

  return 1;
};
