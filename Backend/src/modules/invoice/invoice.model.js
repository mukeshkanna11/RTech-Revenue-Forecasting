const mongoose = require("mongoose");
const { toWords } = require("number-to-words");

/* ===== Item Schema ===== */
const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    hsnCode: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    rate: { type: Number, required: true, min: 0 },
    taxPercent: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

/* ===== Supplier Schema ===== */
const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gstin: { type: String },
    cin: { type: String },
    iec: { type: String },
    iecDate: { type: Date },
    pan: { type: String },
    tel: { type: String },
    email: { type: String },
  },
  { _id: false }
);

/* ===== Customer Schema ===== */
const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    serviceMode: { type: String, default: "Online / ITES" },
  },
  { _id: false }
);

/* ===== Remittance Schema ===== */
const remittanceSchema = new mongoose.Schema(
  {
    beneficiaryName: { type: String },
    accountNumber: { type: String },
    swiftCode: { type: String },
    ifsCode: { type: String },
    bankAddress: { type: String },
  },
  { _id: false }
);

/* ===== Invoice Schema ===== */
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    invoiceDate: { type: Date, default: Date.now, index: true },
    agreementPO: { number: String, date: Date },
    supplier: supplierSchema,
    customer: customerSchema,
    items: { type: [invoiceItemSchema], required: true },
    subTotal: { type: Number, default: 0 },
    totalTaxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    amountInWords: { type: String },
    remittance: remittanceSchema,
    remarks: { type: String, trim: true },
    typeOfClearance: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

/* ===== Auto-generate Invoice Number (safe for SaaS multi-user) ===== */
invoiceSchema.pre("validate", async function(next) {
  if (this.invoiceNumber) return next();
  const Counter = require("./counter.model");
  let counter, exists;
  do {
    counter = await Counter.findByIdAndUpdate(
      { _id: "invoiceNumber" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(counter.seq).padStart(4, "0")}`;
    exists = await mongoose.model("Invoice").exists({ invoiceNumber: this.invoiceNumber });
  } while (exists);
  next();
});


/* ===== Pre-save Calculations ===== */
invoiceSchema.pre("save", function (next) {
  let subTotal = 0;
  let totalTax = 0;

  this.items.forEach((item) => {
    const base = item.quantity * item.rate;
    const tax = (base * (item.taxPercent || 0)) / 100;
    item.taxAmount = tax;
    item.total = base + tax;
    subTotal += base;
    totalTax += tax;
  });

  this.subTotal = subTotal;
  this.totalTaxAmount = totalTax;
  this.grandTotal = subTotal + totalTax;
  this.amountInWords = toWords(this.grandTotal);

  next();
});

/* ===== Soft Delete ===== */
invoiceSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);