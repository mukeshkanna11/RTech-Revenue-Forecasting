const mongoose = require("mongoose");

/**
 * ===============================
 * Invoice Item Schema
 * ===============================
 */
const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },

  hsnCode: {
    type: String
  },

  quantity: {
    type: Number,
    required: true,
    default: 1
  },

  price: {
    type: Number,
    required: true
  },

  discount: {
    type: Number,
    default: 0
  },

  taxPercent: {
    type: Number,
    default: 0
  },

  total: {
    type: Number
  }
});


/**
 * ===============================
 * GST Schema
 * ===============================
 */
const gstSchema = new mongoose.Schema({
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 }
});


/**
 * ===============================
 * Billing Address Schema
 * ===============================
 */
const billingSchema = new mongoose.Schema({
  companyName: String,
  address: String,
  gstNumber: String,
  email: String,
  phone: String
});


/**
 * ===============================
 * Invoice Schema
 * ===============================
 */
const invoiceSchema = new mongoose.Schema(
  {

    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },

    billingAddress: billingSchema,

    issueDate: {
      type: Date,
      default: Date.now
    },

    dueDate: Date,

    currency: {
      type: String,
      default: "INR"
    },

    items: [invoiceItemSchema],

    subtotal: {
      type: Number,
      default: 0
    },

    discount: {
      type: Number,
      default: 0
    },

    gst: gstSchema,

    totalTaxAmount: {
      type: Number,
      default: 0
    },

    grandTotal: {
      type: Number,
      default: 0
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "bank", "upi", "card"]
    },

    status: {
      type: String,
      enum: ["draft", "sent", "paid", "partial", "overdue"],
      default: "draft"
    },

    notes: String,

    isDeleted: {
      type: Boolean,
      default: false
    }

  },
  { timestamps: true }
);

invoiceSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);