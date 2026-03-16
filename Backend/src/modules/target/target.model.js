const mongoose = require("mongoose");

/**
 * Allowed Departments
 * Prevents invalid data in DB
 */
const DEPARTMENTS = [
  "sales",
  "marketing",
  "engineering",
  "finance",
  "hr",
  "operations"
];

const targetSchema = new mongoose.Schema(
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
      min: 2020,
      max: 2100,
      index: true
    },

    department: {
      type: String,
      required: true,
      enum: DEPARTMENTS,
      trim: true,
      lowercase: true,
      index: true
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 0
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false
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
 * ======================================
 * COMPOUND INDEX (VERY IMPORTANT)
 * Prevent duplicate targets
 * ======================================
 */
targetSchema.index(
  { month: 1, year: 1, department: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

/**
 * ======================================
 * QUERY MIDDLEWARE
 * Hide deleted records automatically
 * ======================================
 */
targetSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

/**
 * ======================================
 * VIRTUAL FIELD
 * Example: Quarter
 * ======================================
 */
targetSchema.virtual("quarter").get(function () {
  return Math.ceil(this.month / 3);
});

/**
 * ======================================
 * STATIC METHODS
 * ======================================
 */
targetSchema.statics.getDepartments = function () {
  return DEPARTMENTS;
};

module.exports = mongoose.model("Target", targetSchema);