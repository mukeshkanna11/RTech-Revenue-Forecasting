const Invoice = require("./invoice.model");

/* =========================================
   HELPER: NUMBER TO WORDS (BASIC)
========================================= */
const numberToWords = (num) => {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if ((num = num.toString()).length > 9) return "Overflow";

  const n = ("000000000" + num).substr(-9).match(/.{1,2}/g);
  let str = "";

  str += (Number(n[0]) !== 0) ? (a[Number(n[0])] || b[n[0][0]] + " " + a[n[0][1]]) + " Crore " : "";
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Lakh " : "";
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Thousand " : "";
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Hundred " : "";
  str += (Number(n[4]) !== 0) ? ((str !== "") ? "and " : "") +
    (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " " : "";

  return str.trim() + " Only";
};

/* =========================================
   HELPER: CALCULATE ITEMS + TAX
========================================= */
const calculateInvoice = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one item is required");
  }

  let subtotal = 0;
  let totalTax = 0;

  const updatedItems = items.map((item, index) => {
    const value = Number(item.value || 0);
    const rate = Number(item.igstRate ?? 18); // default 18%

    if (!isFinite(value) || !isFinite(rate)) {
      throw new Error(`Invalid item at position ${index + 1}`);
    }

    const igstAmount = Number(((value * rate) / 100).toFixed(2));
    const total = Number((value + igstAmount).toFixed(2));

    subtotal += value;
    totalTax += igstAmount;

    return {
      description: item.description,
      hsn: item.hsn || "998313",
      value,
      igstRate: rate,
      igstAmount,
      total,
    };
  });

  const grandTotal = Number((subtotal + totalTax).toFixed(2));

  return {
    updatedItems,
    subtotal: Number(subtotal.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    grandTotal,
    amountInWords: numberToWords(Math.round(grandTotal))
  };
};

/* =========================================
   CREATE INVOICE
========================================= */
exports.createInvoice = async (body) => {
  try {
    if (!body.supplier?.name) throw new Error("Supplier details required");
    if (!body.customer?.name) throw new Error("Customer details required");

    const {
      updatedItems,
      subtotal,
      totalTax,
      grandTotal,
      amountInWords
    } = calculateInvoice(body.items);

    const invoice = await Invoice.create({
      ...body,

      // ✅ FORCE CUSTOMER (IMPORTANT)
      customer: {
  name: body.customer.name || "",
  address: body.customer.address || "",
  email: body.customer.email || "",
  phone: body.customer.phone || ""
},

      items: updatedItems,
      subtotal,
      totalTax,
      grandTotal,
      totalAmount: grandTotal,
      amountInWords
    });

    return {
      success: true,
      data: invoice
    };

  } catch (err) {
    throw new Error(err.message);
  }
};

/* =========================================
   GET ALL INVOICES
========================================= */
exports.getAllInvoices = async ({ page = 1, limit = 10, search = "" }) => {
  const query = search
    ? { invoiceNumber: { $regex: search, $options: "i" } }
    : {};

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Invoice.countDocuments(query)
  ]);

  return {
    success: true,
    data,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  };
};

/* =========================================
   GET SINGLE INVOICE
========================================= */
exports.getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new Error("Invoice not found");

  return {
    success: true,
    data: invoice
  };
};

/* =========================================
   UPDATE INVOICE
========================================= */
exports.updateInvoice = async (id, body) => {
  const existing = await Invoice.findById(id);
  if (!existing) throw new Error("Invoice not found");

  let updatedData = { ...body };

  if (body.items) {
    const calc = calculateInvoice(body.items);
    updatedData = {
      ...updatedData,
      items: calc.updatedItems,
      subtotal: calc.subtotal,
      totalTax: calc.totalTax,
      grandTotal: calc.grandTotal,
      totalAmount: calc.grandTotal,
      amountInWords: calc.amountInWords
    };
  }

  const updatedInvoice = await Invoice.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true
  });

  return {
    success: true,
    data: updatedInvoice
  };
};

/* =========================================
   DELETE INVOICE
========================================= */
exports.deleteInvoice = async (id) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new Error("Invoice not found");

  await Invoice.findByIdAndDelete(id);

  return {
    success: true,
    message: "Invoice deleted successfully"
  };
};

/* =========================================
   GET INVOICE FOR PDF
========================================= */
/* =========================================
   GET INVOICE FOR PDF (FIXED)
========================================= */
exports.getInvoiceForPDF = async (id) => {
  const invoice = await Invoice.findById(id).lean();

  if (!invoice) throw new Error("Invoice not found");

  // ✅ FIX: ensure customer key exists
  if (!invoice.customer && invoice.client) {
    invoice.customer = invoice.client;
  }

  // ✅ DEBUG FULL DATA
  console.log("FULL PDF DATA:", invoice);

  return invoice;
};

/* =========================================
   DOWNLOAD PDF (CLEAN VERSION)
========================================= */
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    const React = require("react");
    const ReactPDF = require("@react-pdf/renderer");
    const InvoicePDF = require("./invoice.pdf").default;

    // ✅ 1. FETCH DATA (LEAN OBJECT)
    let invoice = await Invoice.findById(id).lean();

    if (!invoice) throw new Error("Invoice not found");

    /* ===============================
       ✅ CUSTOMER FIX (FINAL)
    =============================== */
    invoice.customer =
      invoice.customer && Object.keys(invoice.customer).length > 0
        ? invoice.customer
        : invoice.client ||
          invoice.customerDetails || {
            name: "",
            address: "",
            email: "",
            phone: ""
          };

    /* ===============================
       ✅ TOTAL FIX (VERY IMPORTANT)
    =============================== */
    let subtotal = 0;
    let tax = 0;

    (invoice.items || []).forEach((item) => {
      subtotal += Number(item.value || 0);
      tax += Number(item.igstAmount || 0);
    });

    invoice.subtotal = invoice.subtotal || subtotal;
    invoice.totalTax = invoice.totalTax || tax;
    invoice.grandTotal =
      invoice.grandTotal ||
      invoice.totalAmount ||
      subtotal + tax;

    /* ===============================
       ✅ DEBUG
    =============================== */
    console.log("FINAL PDF DATA:", invoice);

    /* ===============================
       ✅ CREATE PDF ELEMENT
    =============================== */
    const element = React.createElement(InvoicePDF, {
      invoice
    });

    if (!element) {
      throw new Error("Failed to create PDF element");
    }

    /* ===============================
       ✅ GENERATE STREAM
    =============================== */
    const stream = await ReactPDF.renderToStream(element);

    /* ===============================
       ✅ HEADERS
    =============================== */
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${
        invoice.invoiceNumber || "invoice"
      }.pdf`
    });

    /* ===============================
       ✅ PIPE RESPONSE
    =============================== */
    stream.pipe(res);

    stream.on("end", () => res.end());

    stream.on("error", (err) => {
      console.error("STREAM ERROR:", err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "PDF generation failed"
        });
      }
    });

  } catch (err) {
    console.error("PDF ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};