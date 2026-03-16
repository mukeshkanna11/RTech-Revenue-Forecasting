const mongoose = require("mongoose");

/**
 * =====================================
 * CONSTANTS
 * =====================================
 */

const DEPARTMENTS = [
  "sales",
  "marketing",
  "operations",
  "finance",
  "technology",
  "hr"
];

/**
 * =====================================
 * REVENUE SCHEMA
 * =====================================
 */

const revenueSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true
    },

    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
      index: true
    },

    department: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: DEPARTMENTS,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isFinite,
        message: "Revenue amount must be a valid number"
      }
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      enum: ["INR", "USD", "EUR"]
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    deletedAt: {
      type: Date,
      default: null
    }

  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);





/**
 * =====================================
 * UNIQUE INDEX
 * Prevent duplicate revenue entry
 * =====================================
 */

revenueSchema.index(
  { month: 1, year: 1, department: 1 },
  { unique: true }
);





/**
 * =====================================
 * ANALYTICS INDEXES
 * Dashboard performance
 * =====================================
 */

revenueSchema.index({ year: 1, month: 1 });

revenueSchema.index({ department: 1, year: 1 });

revenueSchema.index({ department: 1, month: 1, year: 1 });





/**
 * =====================================
 * VIRTUAL FIELD
 * Example: 2026-03
 * =====================================
 */

revenueSchema.virtual("period").get(function () {
  return `${this.year}-${String(this.month).padStart(2, "0")}`;
});





/**
 * =====================================
 * QUERY MIDDLEWARE
 * Auto exclude soft deleted
 * =====================================
 */

revenueSchema.pre(/^find/, function (next) {

  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }

  next();

});





/**
 * =====================================
 * PRE SAVE HOOK
 * Normalize data
 * =====================================
 */

revenueSchema.pre("save", function (next) {

  if (this.department) {
    this.department = this.department.toLowerCase();
  }

  next();

});





/**
 * =====================================
 * STATIC METHOD
 * Total Revenue
 * =====================================
 */

revenueSchema.statics.getTotalRevenue = async function () {

  const result = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" }
      }
    }
  ]);

  return result[0]?.totalRevenue || 0;

};





/**
 * =====================================
 * STATIC METHOD
 * Monthly Revenue
 * =====================================
 */

revenueSchema.statics.getMonthlyRevenue = async function (year) {

  return this.aggregate([
    {
      $match: {
        year: Number(year),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: "$month",
        revenue: { $sum: "$amount" }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

};





/**
 * =====================================
 * STATIC METHOD
 * Department Revenue
 * =====================================
 */

revenueSchema.statics.getDepartmentRevenue = async function () {

  return this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$department",
        revenue: { $sum: "$amount" }
      }
    },
    {
      $sort: { revenue: -1 }
    }
  ]);

};





/**
 * =====================================
 * INSTANCE METHOD
 * SOFT DELETE
 * =====================================
 */

revenueSchema.methods.softDelete = function () {

  this.isDeleted = true;
  this.deletedAt = new Date();

  return this.save();

};





/**
 * =====================================
 * MODEL EXPORT
 * =====================================
 */

module.exports = mongoose.model("Revenue", revenueSchema);