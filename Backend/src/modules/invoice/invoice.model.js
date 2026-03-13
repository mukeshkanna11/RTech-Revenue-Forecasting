const mongoose = require("mongoose");
const Counter = require("./counter.model");


/* =====================================
   Invoice Item Schema
===================================== */

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true
    },

    hsnCode: {
      type: String,
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    taxPercent: {
      type: Number,
      default: 0,
      min: 0
    },

    taxAmount: {
      type: Number,
      default: 0
    },

    total: {
      type: Number,
      default: 0
    }

  },
  { _id: false }
);


/* =====================================
   GST Schema
===================================== */

const gstSchema = new mongoose.Schema(
  {
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 }
  },
  { _id: false }
);


/* =====================================
   Billing Schema
===================================== */

const billingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      trim: true
    },

    address: String,

    gstNumber: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      lowercase: true
    },

    phone: String
  },
  { _id: false }
);


/* =====================================
   Invoice Schema
===================================== */

const invoiceSchema = new mongoose.Schema(
  {

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true
    },

    billingAddress: billingSchema,

    issueDate: {
      type: Date,
      default: Date.now,
      index: true
    },

    dueDate: {
      type: Date
    },

    currency: {
      type: String,
      enum: ["INR", "USD", "EUR"],
      default: "INR"
    },

    items: {
      type: [invoiceItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "Invoice must contain at least one item"
      }
    },

    subTotal: {
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
      default: "draft",
      index: true
    },

    notes: {
      type: String,
      trim: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


/* =====================================
   INDEXES (Performance)
===================================== */

invoiceSchema.index({ client: 1, createdAt: -1 });

invoiceSchema.index({
  invoiceNumber: "text",
  notes: "text"
});

invoiceSchema.index({ status: 1, issueDate: -1 });

/* =====================================
   AUTO INVOICE NUMBER GENERATOR
===================================== */

invoiceSchema.pre("validate", async function (next) {

  if (this.invoiceNumber) return next();

  try {

    const counter = await Counter.findByIdAndUpdate(
      { _id: "invoiceNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const year = new Date().getFullYear();

    this.invoiceNumber =
      `INV-${year}-${String(counter.seq).padStart(4, "0")}`;

    next();

  } catch (err) {
    next(err);
  }

});

/* =====================================
   PRE SAVE HOOK (Auto Calculations)
===================================== */

invoiceSchema.pre("save", function (next) {

  let subTotal = 0;
  let totalTax = 0;

  this.items.forEach((item) => {

    const base = item.quantity * item.price - item.discount;

    const tax = (base * item.taxPercent) / 100;

    item.taxAmount = tax;
    item.total = base + tax;

    subTotal += base;
    totalTax += tax;

  });

  this.subTotal = subTotal;
  this.totalTaxAmount = totalTax;

  this.grandTotal = subTotal - this.discount + totalTax;

  next();

});


/* =====================================
   QUERY MIDDLEWARE
   (Hide soft deleted invoices)
===================================== */

invoiceSchema.pre(/^find/, function (next) {

  this.where({ isDeleted: false });

  next();

});


/* =====================================
   VIRTUALS
===================================== */

invoiceSchema.virtual("isOverdue").get(function () {

  if (!this.dueDate) return false;

  return this.status !== "paid" && this.dueDate < new Date();

});


/* =====================================
   MODEL
===================================== */

module.exports = mongoose.model("Invoice", invoiceSchema);