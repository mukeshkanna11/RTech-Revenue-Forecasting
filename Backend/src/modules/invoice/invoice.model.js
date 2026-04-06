const mongoose = require("mongoose");
const Counter = require("./counter.model");

/* =========================================
   ITEM SUBSCHEMA
========================================= */
const itemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },

    hsn: {
      type: String,
      required: true,
      trim: true,
      default: "998313" // IT Services default
    },

    value: { type: Number, required: true, min: 0 },

    igstRate: {
      type: Number,
      default: 18, // ✅ FIXED GST
      min: 0
    },

    igstAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  { _id: false }
);

/* =========================================
   MAIN SCHEMA
========================================= */
const invoiceSchema = new mongoose.Schema(
  {
    /* ================= CLIENT (OPTIONAL) ================= */
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      index: true
    },

    /* ================= INVOICE INFO ================= */
    invoiceNumber: { type: String, unique: true, index: true },

    invoiceDate: {
      type: Date,
      required: true,
      index: true
    },

    agreementPO: {
      number: { type: String, trim: true },
      date: Date
    },

    serviceMode: {
      type: String,
      default: "Online / ITES"
    },

    /* ================= SUPPLIER ================= */
    supplier: {
      name: { type: String, required: true },
      gstin: { type: String, required: true },
      cin: String,
      pan: String,
      iec: String,
      iecDate: Date,
      email: String,
      phone: String
    },

    /* ================= CUSTOMER ================= */
    customer: {
      name: { type: String, required: true },
      address: String,
      email: String,
      phone: String
    },

    /* ================= ITEMS ================= */
    items: {
      type: [itemSchema],
      validate: [(val) => val.length > 0, "At least one item required"]
    },

    /* ================= TAX SUMMARY ================= */
    subtotal: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    totalAmount: { type: Number, default: 0 },

    /* ================= GST ================= */
    placeOfSupply: String,

    /* ================= LUT DETAILS ================= */
    lut: {
      type: {
        type: String,
        default: "LUT" // or "Export"
      },
      arn: String,
      date: Date
    },

    /* ================= PAYMENT ================= */
    paymentTerms: {
      type: String,
      default: "Due on Receipt"
    },

    /* ================= BANK DETAILS ================= */
    remittance: {
      beneficiaryName: String,
      accountNumber: String,
      swiftCode: String,
      ifscCode: String,
      bankAddress: String
    },

    /* ================= EXTRA ================= */
    amountInWords: String,

    companyDisplayName: String, // For signature block

    authorisedSignatory: String,

    remark: String
  },
  { timestamps: true }
);

/* =========================================
   PRE-SAVE: CALCULATE TOTALS
========================================= */
invoiceSchema.pre("save", function (next) {
  let subtotal = 0;
  let totalTax = 0;

  this.items = this.items.map((item) => {
    const value = Number(item.value || 0);
    const rate = Number(item.igstRate ?? 18);

    const igstAmount = Number(((value * rate) / 100).toFixed(2));
    const totalItem = Number((value + igstAmount).toFixed(2));

    subtotal += value;
    totalTax += igstAmount;

    return {
      ...item,
      igstAmount,
      total: totalItem
    };
  });

  this.subtotal = Number(subtotal.toFixed(2));
  this.totalTax = Number(totalTax.toFixed(2));
  this.grandTotal = Number((subtotal + totalTax).toFixed(2));
  this.totalAmount = this.grandTotal;

  next();
});

/* =========================================
   PRE-SAVE: AUTO INVOICE NUMBER
========================================= */
invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();

    const counter = await Counter.findOneAndUpdate(
      { key: `invoice_${year}` },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    this.invoiceNumber = `INV-${year}-${String(counter.value).padStart(4, "0")}`;
  }

  next();
});

/* =========================================
   STATIC METHODS
========================================= */
invoiceSchema.statics.findByInvoiceNumber = function (invoiceNumber) {
  return this.findOne({ invoiceNumber });
};

/* =========================================
   INDEXES (PERFORMANCE)
========================================= */
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ "customer.name": 1 });

/* =========================================
   EXPORT
========================================= */
module.exports = mongoose.model("Invoice", invoiceSchema);