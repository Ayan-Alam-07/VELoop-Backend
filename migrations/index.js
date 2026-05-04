const migrations = [
  require("./001_add_level_fields"),
  require("./002_add_weekly_fields"),
];

const runMigrations = async () => {
  for (const migrate of migrations) {
    await migrate();
  }
};

module.exports = runMigrations;
