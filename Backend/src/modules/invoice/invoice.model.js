const mongoose = require("mongoose");
const Counter = require("./counter.model");

/* ===================================================
   ITEM SCHEMA
=================================================== */

const itemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true
    },

    hsn: {
      type: String,
      default: "998313",
      trim: true
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    taxableValue: {
      type: Number,
      default: 0
    },

    cgstRate: {
      type: Number,
      default: 9
    },

    sgstRate: {
      type: Number,
      default: 9
    },

    igstRate: {
      type: Number,
      default: 18
    },

    cgstAmount: {
      type: Number,
      default: 0
    },

    sgstAmount: {
      type: Number,
      default: 0
    },

    igstAmount: {
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

/* ===================================================
   INVOICE SCHEMA
=================================================== */

const invoiceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      index: true
    },

    /* =======================
       INVOICE INFO
    ======================= */

    invoiceNumber: {
      type: String,
      unique: true,
      index: true
    },

    invoiceDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    orderDate: Date,

    dueDate: Date,

    purchaseOrderNumber: String,

    purchaseOrderDate: Date,

    serviceMode: {
      type: String,
      default: "Online / IT Services"
    },

    /* =======================
       SUPPLIER
    ======================= */

    supplier: {
      name: {
        type: String,
        required: true
      },

      address: String,

      gstin: {
        type: String,
        required: true
      },

      cin: String,

      pan: String,

      iec: String,

      email: String,

      phone: String,

      website: String
    },

    /* =======================
       CUSTOMER
    ======================= */

    customer: {
      name: {
        type: String,
        required: true
      },

      gstin: String,

      contactPerson: String,

      email: String,

      phone: String,

      billingAddress: String,

      shippingAddress: String,

      state: String,

      country: {
        type: String,
        default: "India"
      }
    },

    /* =======================
       GST TYPE
    ======================= */

    taxType: {
      type: String,
      enum: ["CGST_SGST", "IGST", "EXPORT"],
      default: "IGST"
    },

    placeOfSupply: String,

    /* =======================
       ITEMS
    ======================= */

    items: {
      type: [itemSchema],
      validate: [
        (items) => items.length > 0,
        "At least one item is required"
      ]
    },

    /* =======================
       TOTALS
    ======================= */

    subtotal: {
      type: Number,
      default: 0
    },

    discountAmount: {
      type: Number,
      default: 0
    },

    cgstTotal: {
      type: Number,
      default: 0
    },

    sgstTotal: {
      type: Number,
      default: 0
    },

    igstTotal: {
      type: Number,
      default: 0
    },

    otherCharges: {
      type: Number,
      default: 0
    },

    tdsAmount: {
      type: Number,
      default: 0
    },

    grandTotal: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      default: 0
    },

    /* =======================
       PAYMENT
    ======================= */

    paymentTerms: {
      type: String,
      default: "Due on Receipt"
    },

    paymentStatus: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Partially Paid",
        "Paid",
        "Overdue",
        "Cancelled"
      ],
      default: "Pending"
    },

    paymentDate: Date,

    /* =======================
       CURRENCY
    ======================= */

    currency: {
      type: String,
      default: "INR"
    },

    exchangeRate: {
      type: Number,
      default: 1
    },

    /* =======================
       LUT / EXPORT
    ======================= */

    lut: {
      arn: String,
      date: Date
    },

    exportDetails: {
      isExport: {
        type: Boolean,
        default: false
      },

      country: String,

      portCode: String,

      shippingBillNumber: String,

      shippingBillDate: Date
    },

    /* =======================
       BANK DETAILS
    ======================= */

    remittance: {
      beneficiaryName: String,

      accountNumber: String,

      bankName: String,

      branchName: String,

      swiftCode: String,

      ifscCode: String,

      bankAddress: String
    },

    /* =======================
       SIGNATURE
    ======================= */

    companyDisplayName: String,

    authorisedSignatory: String,

    digitalSignatureUrl: String,

    /* =======================
       EXTRA
    ======================= */

    amountInWords: String,

    notes: String,

    termsAndConditions: {
      type: String,
      default:
        "Payment due within agreed terms. Late payments may attract additional charges."
    },

    remark: String
  },
  {
    timestamps: true
  }
);

/* ===================================================
   CALCULATE TOTALS
=================================================== */

invoiceSchema.pre("save", function (next) {
  try {
    let subtotal = 0;
    let discountAmount = 0;

    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    if (!Array.isArray(this.items)) {
      this.items = [];
    }

    this.items.forEach((item) => {
      const qty = Math.max(1, Number(item.quantity || 1));

      const unitPrice = Math.max(
        0,
        Number(item.unitPrice || 0)
      );

      const discount = Math.max(
        0,
        Number(item.discount || 0)
      );

      /* -------------------------
         TAXABLE VALUE
      ------------------------- */

      const grossAmount = qty * unitPrice;

      const taxableValue = Math.max(
        0,
        grossAmount - discount
      );

      /* -------------------------
         GST
      ------------------------- */

      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (this.taxType === "CGST_SGST") {
        cgstAmount =
          (taxableValue *
            Number(item.cgstRate || 9)) /
          100;

        sgstAmount =
          (taxableValue *
            Number(item.sgstRate || 9)) /
          100;
      }

      else if (this.taxType === "IGST") {
        igstAmount =
          (taxableValue *
            Number(item.igstRate || 18)) /
          100;
      }

      /* EXPORT WITH LUT */
      else if (this.taxType === "EXPORT") {
        cgstAmount = 0;
        sgstAmount = 0;
        igstAmount = 0;
      }

      /* -------------------------
         ITEM TOTAL
      ------------------------- */

      const itemTotal =
        taxableValue +
        cgstAmount +
        sgstAmount +
        igstAmount;

      /* -------------------------
         SAVE ITEM VALUES
      ------------------------- */

      item.taxableValue = Number(
        taxableValue.toFixed(2)
      );

      item.cgstAmount = Number(
        cgstAmount.toFixed(2)
      );

      item.sgstAmount = Number(
        sgstAmount.toFixed(2)
      );

      item.igstAmount = Number(
        igstAmount.toFixed(2)
      );

      item.total = Number(
        itemTotal.toFixed(2)
      );

      /* -------------------------
         ACCUMULATE TOTALS
      ------------------------- */

      subtotal += taxableValue;
      discountAmount += discount;

      cgstTotal += cgstAmount;
      sgstTotal += sgstAmount;
      igstTotal += igstAmount;
    });

    /* -------------------------
       ROUND TOTALS
    ------------------------- */

    subtotal = Number(
      subtotal.toFixed(2)
    );

    discountAmount = Number(
      discountAmount.toFixed(2)
    );

    cgstTotal = Number(
      cgstTotal.toFixed(2)
    );

    sgstTotal = Number(
      sgstTotal.toFixed(2)
    );

    igstTotal = Number(
      igstTotal.toFixed(2)
    );

    const otherCharges = Number(
      this.otherCharges || 0
    );

    const tdsAmount = Number(
      this.tdsAmount || 0
    );

    /* -------------------------
       GRAND TOTAL
    ------------------------- */

    const grandTotal =
      subtotal +
      cgstTotal +
      sgstTotal +
      igstTotal +
      otherCharges -
      tdsAmount;

    /* -------------------------
       SAVE INVOICE TOTALS
    ------------------------- */

    this.subtotal = subtotal;

    this.discountAmount =
      discountAmount;

    this.cgstTotal = cgstTotal;

    this.sgstTotal = sgstTotal;

    this.igstTotal = igstTotal;

    this.grandTotal = Number(
      grandTotal.toFixed(2)
    );

    this.totalAmount =
      this.grandTotal;

    next();
  } catch (error) {
    next(error);
  }
});
/* ===================================================
   AUTO INVOICE NUMBER
=================================================== */

invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();

    const counter = await Counter.findOneAndUpdate(
      {
        key: `invoice_${year}`
      },
      {
        $inc: { value: 1 }
      },
      {
        new: true,
        upsert: true
      }
    );

    this.invoiceNumber =
      `INV-${year}-${String(counter.value).padStart(5, "0")}`;
  }

  next();
});

/* ===================================================
   STATIC METHODS
=================================================== */

invoiceSchema.statics.findByInvoiceNumber =
  function (invoiceNumber) {
    return this.findOne({
      invoiceNumber
    });
  };

/* ===================================================
   INDEXES
=================================================== */

invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ "customer.name": 1 });
invoiceSchema.index({ clientId: 1 });

/* ===================================================
   EXPORT
=================================================== */

module.exports = mongoose.model(
  "Invoice",
  invoiceSchema
);