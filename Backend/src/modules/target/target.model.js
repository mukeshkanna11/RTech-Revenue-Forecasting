const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    targetAmount: {
      type: Number,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Target", targetSchema);