const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },

    value: {
      type: Number,
      default: 0,
      min: 0
    },

    prefix: {
      type: String,
      default: "INV"
    },

    year: {
      type: Number,
      default: () => new Date().getFullYear()
    }
  },
  {
    timestamps: true
  }
);

counterSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model("Counter", counterSchema);