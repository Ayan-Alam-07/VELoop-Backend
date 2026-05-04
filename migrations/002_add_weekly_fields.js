const User = require("../models/User");
const Migration = require("../models/Migration");

const MIGRATION_NAME = "002_add_weekly_fields";

const runMigration = async () => {
  try {
    console.log(`🔍 Checking migration: ${MIGRATION_NAME}`);

    // 1️⃣ Check if already executed
    const alreadyRun = await Migration.findOne({ name: MIGRATION_NAME });

    if (alreadyRun) {
      console.log("⏭ Migration already executed. Skipping...");
      return;
    }

    console.log("🚀 Running migration...");

    // 2️⃣ Update ONLY users missing new fields
    const result = await User.updateMany(
      {
        $or: [
          { weeklyCoinsEarned: { $exists: false } },
          { isWeeklyLeaderboardParticipant: { $exists: false } },
          { lastWeeklyParticipationAt: { $exists: false } },
        ],
      },
      {
        $set: {
          weeklyCoinsEarned: 0,
          isWeeklyLeaderboardParticipant: false,
          lastWeeklyParticipationAt: null,
        },
      },
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);

    // 3️⃣ Mark as executed
    await Migration.create({
      name: MIGRATION_NAME,
    });

    console.log("🎉 Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
};

module.exports = runMigration;
