const mongoose = require("mongoose");

const migrationSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  executedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Migration", migrationSchema);
