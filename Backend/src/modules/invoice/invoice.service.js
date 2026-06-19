const Invoice = require("./invoice.model");
const { toWords } = require("number-to-words");

/* ==================================================
   HELPER: NUMBER TO WORDS
================================================== */

const amountToWords = (amount) => {
  try {
    return `${toWords(Math.round(amount))} Rupees Only`
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "";
  }
};

/* ==================================================
   CALCULATE INVOICE TOTALS
================================================== */

const calculateInvoice = (
  items = [],
  taxType = "IGST",
  otherCharges = 0,
  tdsAmount = 0
) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one item is required");
  }

  let subtotal = 0;
  let discountAmount = 0;

  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  const updatedItems = items.map((item, index) => {
    const quantity = Number(item.quantity || 1);
    const unitPrice = Number(item.unitPrice || 0);
    const discount = Number(item.discount || 0);

    if (!isFinite(quantity) || !isFinite(unitPrice)) {
      throw new Error(
        `Invalid item data at row ${index + 1}`
      );
    }

    const taxableValue =
      quantity * unitPrice - discount;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "CGST_SGST") {
      cgstAmount =
        (taxableValue *
          Number(item.cgstRate || 9)) /
        100;

      sgstAmount =
        (taxableValue *
          Number(item.sgstRate || 9)) /
        100;
    }

    if (taxType === "IGST") {
      igstAmount =
        (taxableValue *
          Number(item.igstRate || 18)) /
        100;
    }

    const total =
      taxableValue +
      cgstAmount +
      sgstAmount +
      igstAmount;

    subtotal += taxableValue;
    discountAmount += discount;

    cgstTotal += cgstAmount;
    sgstTotal += sgstAmount;
    igstTotal += igstAmount;

    return {
      description: item.description,
      hsn: item.hsn || "998313",

      quantity,

      unitPrice,

      discount,

      taxableValue: Number(
        taxableValue.toFixed(2)
      ),

      cgstRate: Number(
        item.cgstRate || 9
      ),

      sgstRate: Number(
        item.sgstRate || 9
      ),

      igstRate: Number(
        item.igstRate || 18
      ),

      cgstAmount: Number(
        cgstAmount.toFixed(2)
      ),

      sgstAmount: Number(
        sgstAmount.toFixed(2)
      ),

      igstAmount: Number(
        igstAmount.toFixed(2)
      ),

      total: Number(total.toFixed(2))
    };
  });

  const grandTotal =
    subtotal +
    cgstTotal +
    sgstTotal +
    igstTotal +
    Number(otherCharges || 0) -
    Number(tdsAmount || 0);

  return {
    items: updatedItems,

    subtotal: Number(
      subtotal.toFixed(2)
    ),

    discountAmount: Number(
      discountAmount.toFixed(2)
    ),

    cgstTotal: Number(
      cgstTotal.toFixed(2)
    ),

    sgstTotal: Number(
      sgstTotal.toFixed(2)
    ),

    igstTotal: Number(
      igstTotal.toFixed(2)
    ),

    grandTotal: Number(
      grandTotal.toFixed(2)
    ),

    totalAmount: Number(
      grandTotal.toFixed(2)
    ),

    amountInWords:
      amountToWords(grandTotal)
  };
};

/* ==================================================
   CREATE INVOICE
================================================== */

exports.createInvoice = async (body) => {
  if (!body.supplier?.name) {
    throw new Error("Supplier name is required");
  }

  if (!body.customer?.name) {
    throw new Error("Customer name is required");
  }

  const totals = calculateInvoice(
    body.items,
    body.taxType,
    body.otherCharges,
    body.tdsAmount
  );

  const invoice = await Invoice.create({
    ...body,
    ...totals
  });

  return {
    success: true,
    data: invoice
  };
};

/* ==================================================
   GET ALL INVOICES
================================================== */

exports.getAllInvoices = async ({
  page = 1,
  limit = 10,
  search = "",
  status
}) => {
  const query = {};

  if (search) {
    query.$or = [
      {
        invoiceNumber: {
          $regex: search,
          $options: "i"
        }
      },
      {
        "customer.name": {
          $regex: search,
          $options: "i"
        }
      }
    ];
  }

  if (status) {
    query.paymentStatus = status;
  }

  const skip =
    (Number(page) - 1) *
    Number(limit);

  const [data, total] =
    await Promise.all([
      Invoice.find(query)
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(Number(limit)),

      Invoice.countDocuments(query)
    ]);

  return {
    success: true,
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(
        total / limit
      )
    }
  };
};

/* ==================================================
   GET SINGLE INVOICE
================================================== */

exports.getInvoiceById = async (
  id
) => {
  const invoice =
    await Invoice.findById(id);

  if (!invoice) {
    throw new Error(
      "Invoice not found"
    );
  }

  return {
    success: true,
    data: invoice
  };
};

/* ==================================================
   UPDATE INVOICE
================================================== */

exports.updateInvoice = async (
  id,
  body
) => {
  const existing =
    await Invoice.findById(id);

  if (!existing) {
    throw new Error(
      "Invoice not found"
    );
  }

  let updateData = {
    ...body
  };

  const items =
    body.items || existing.items;

  const taxType =
    body.taxType || existing.taxType;

  const otherCharges =
    body.otherCharges ??
    existing.otherCharges ??
    0;

  const tdsAmount =
    body.tdsAmount ??
    existing.tdsAmount ??
    0;

  /* =================================
     RECALCULATE TOTALS
  ================================= */

  if (
    body.items ||
    body.taxType ||
    body.otherCharges !== undefined ||
    body.tdsAmount !== undefined
  ) {
    const totals = calculateInvoice(
      items,
      taxType,
      otherCharges,
      tdsAmount
    );

    updateData = {
      ...updateData,
      ...totals
    };
  }

  const invoice =
    await Invoice.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

  return {
    success: true,
    data: invoice
  };
};

/* ==================================================
   DELETE INVOICE
================================================== */

exports.deleteInvoice = async (
  id
) => {
  const invoice =
    await Invoice.findById(id);

  if (!invoice) {
    throw new Error(
      "Invoice not found"
    );
  }

  await Invoice.findByIdAndDelete(
    id
  );

  return {
    success: true,
    message:
      "Invoice deleted successfully"
  };
};

/* ==================================================
   GET PDF DATA
================================================== */

exports.getInvoiceForPDF =
  async (id) => {
    const invoice =
      await Invoice.findById(id)
        .lean();

    if (!invoice) {
      throw new Error(
        "Invoice not found"
      );
    }

    invoice.customer =
      invoice.customer || {};

    invoice.supplier =
      invoice.supplier || {};

    invoice.remittance =
      invoice.remittance || {};

    invoice.exportDetails =
      invoice.exportDetails || {};

    invoice.lut =
      invoice.lut || {};

    invoice.items =
      invoice.items || [];

    return invoice;
  };

/* ==================================================
   GET INVOICE BY NUMBER
================================================== */

exports.getInvoiceByNumber =
  async (
    invoiceNumber
  ) => {
    const invoice =
      await Invoice.findOne({
        invoiceNumber
      });

    if (!invoice) {
      throw new Error(
        "Invoice not found"
      );
    }

    return {
      success: true,
      data: invoice
    };
  };