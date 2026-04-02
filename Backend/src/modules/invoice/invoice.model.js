const mongoose = require("mongoose");
const Counter = require("./counter.model");

/* =========================================
   ITEM SUBSCHEMA
========================================= */
const itemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    hsn: { type: String, trim: true },
    value: { type: Number, required: true, min: 0 },
    igstRate: { type: Number, default: 0, min: 0 },
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
    // ✅ Make clientId optional so invoices can be created without Client module
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: false, // <-- changed from true to false
      index: true
    },

    invoiceNumber: { type: String, unique: true, index: true },

    invoiceDate: { type: Date, required: true, index: true },

    agreementPO: {
      number: { type: String, trim: true },
      date: Date
    },

    serviceMode: { type: String, default: "Online / ITES" },

    supplier: {
      name: String,
      gstin: String,
      cin: String,
      pan: String,
      iec: String,
      iecDate: Date,
      email: String,
      phone: String
    },

    items: {
      type: [itemSchema],
      validate: [(val) => val.length > 0, "At least one item required"]
    },

    totalAmount: { type: Number, default: 0, min: 0 },

    remittance: {
      beneficiaryName: String,
      accountNumber: String,
      swiftCode: String,
      ifscCode: String,
      bankAddress: String
    },

    remark: String
  },
  { timestamps: true }
);

/* =========================================
   AUTO CALCULATE ITEMS (SAFETY)
========================================= */
invoiceSchema.pre("save", function (next) {
  let total = 0;

  this.items = this.items.map((item) => {
    const value = Number(item.value || 0);
    const rate = Number(item.igstRate || 0);
    const igstAmount = Number(((value * rate) / 100).toFixed(2));
    const totalItem = Number((value + igstAmount).toFixed(2));
    total += totalItem;

    return { ...item, igstAmount, total: totalItem };
  });

  this.totalAmount = Number(total.toFixed(2));
  next();
});

/* =========================================
   AUTO INVOICE NUMBER (SAFE + YEAR BASED)
========================================= */
invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();

    const counter = await Counter.findOneAndUpdate(
      { key: `invoice_${year}` },
      { $inc: { value: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    this.invoiceNumber = `INV-${year}-${String(counter.value).padStart(4, "0")}`;
  }
  next();
});

/* =========================================
   STATIC: FIND BY INVOICE NUMBER
========================================= */
invoiceSchema.statics.findByInvoiceNumber = function (invoiceNumber) {
  return this.findOne({ invoiceNumber });
};

/* =========================================
   INDEXES (PERFORMANCE)
========================================= */
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);