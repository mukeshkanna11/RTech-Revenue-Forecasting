const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Client name required"],
      trim: true,
      minlength: 2,
      maxlength: 120
    },

    companyName: {
      type: String,
      trim: true,
      maxlength: 150
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"]
    },

    phone: {
      type: String,
      trim: true
    },

    address: {
      type: String,
      trim: true
    },

    industry: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

    notes: String,

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* Indexes */

clientSchema.index({ email: 1 }, { unique: true });
clientSchema.index({ status: 1 });
clientSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Client", clientSchema);