const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    department: { type: String, required: true },
    amount: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

revenueSchema.index(
  { month: 1, year: 1, department: 1 },
  { unique: true }
);

module.exports = mongoose.model("Revenue", revenueSchema);