const mongoose = require("mongoose");

const DEPARTMENTS = ["sales","marketing","operations","finance","technology","hr"];

const revenueSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true, min: 1, max: 12, index: true },
    year: { type: Number, required: true, min: 2000, max: 2100, index: true },
    department: { type: String, required: true, trim: true, lowercase: true, enum: DEPARTMENTS, index: true },
    amount: { type: Number, required: true, min: 0, validate: { validator: Number.isFinite, message: "Revenue must be a valid number" } },
    currency: { type: String, default: "INR", uppercase: true, enum: ["INR","USD","EUR"] },
    notes: { type: String, trim: true, maxlength: 500 },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 🔹 UNIQUE compound index to prevent duplicates per department/month/year
revenueSchema.index({ department: 1, month: 1, year: 1 }, { unique: true, background: true });

// 🔹 Analytics / performance indexes
revenueSchema.index({ year: 1, month: 1 });
revenueSchema.index({ department: 1, year: 1 });

// 🔹 Virtual: period in YYYY-MM format
revenueSchema.virtual("period").get(function () {
  return `${this.year}-${String(this.month).padStart(2, "0")}`;
});

// 🔹 Query middleware: exclude soft-deleted by default
revenueSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) this.where({ isDeleted: false });
  next();
});

// 🔹 Normalize department before save
revenueSchema.pre("save", function (next) {
  if (this.department) this.department = this.department.toLowerCase();
  next();
});

// 🔹 Static methods for dashboards / SaaS analytics
revenueSchema.statics.getTotalRevenue = async function () {
  const result = await this.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
  ]);
  return result[0]?.totalRevenue || 0;
};

revenueSchema.statics.getMonthlyRevenue = async function (year) {
  return this.aggregate([
    { $match: { year: Number(year), isDeleted: false } },
    { $group: { _id: "$month", revenue: { $sum: "$amount" } } },
    { $sort: { _id: 1 } }
  ]);
};

revenueSchema.statics.getDepartmentRevenue = async function () {
  return this.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$department", revenue: { $sum: "$amount" } } },
    { $sort: { revenue: -1 } }
  ]);
};

// 🔹 Instance method: soft delete
revenueSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

module.exports = mongoose.model("Revenue", revenueSchema);