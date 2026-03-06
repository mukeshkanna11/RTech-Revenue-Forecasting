const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    companyName: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    address: {
      type: String
    },

    industry: {
      type: String
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

    notes: {
      type: String
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

clientSchema.index({ email: 1 });

module.exports = mongoose.model("Client", clientSchema);