const User = require("../models/User");
const Migration = require("../models/Migration");

const MIGRATION_NAME = "001_add_level_fields";

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

    // 2️⃣ Update ONLY users missing fields
    const result = await User.updateMany(
      {
        $or: [
          { level: { $exists: false } },
          { dailyXP: { $exists: false } },
          { lastXPUpdate: { $exists: false } },
        ],
      },
      {
        $set: {
          level: 0,
          dailyXP: 0,
          lastXPUpdate: new Date(),
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
