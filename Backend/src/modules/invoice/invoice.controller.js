const mongoose = require("mongoose");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const service = require("./invoice.service");

const React = require("react");
const ReactPDF = require("@react-pdf/renderer");

// ✅ FIXED IMPORT
const InvoicePDF = require("./invoice.pdf");

const Invoice = require("./invoice.model");

/* =========================================
   RESPONSE HELPER
========================================= */
const sendResponse = (res, {
  success = true,
  status = 200,
  message = "",
  data = null
}) => {
  return res.status(status).json({
    success,
    message,
    data
  });
};

/* =========================================
   VALIDATE OBJECT ID
========================================= */
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid invoice ID");
  }
};

/* =========================================
   CREATE INVOICE (SERVICE BASED)
========================================= */
exports.createInvoice = async (req, res) => {
  try {
    const result = await service.createInvoice(req.body);

    return sendResponse(res, {
      message: "Invoice created successfully",
      data: result.data
    });

  } catch (error) {
    return sendResponse(res, {
      success: false,
      status: 400,
      message: error.message
    });
  }
};

/* =========================================
   GET ALL INVOICES
========================================= */
exports.getInvoices = async (req, res) => {
  try {
    const result = await service.getAllInvoices(req.query);

    return sendResponse(res, {
      message: "Invoices fetched successfully",
      data: result
    });

  } catch (err) {
    return sendResponse(res, {
      success: false,
      status: 400,
      message: err.message
    });
  }
};

/* =========================================
   GET SINGLE INVOICE
========================================= */
exports.getInvoice = async (req, res) => {
  try {
    validateObjectId(req.params.id);

    const result = await service.getInvoiceById(req.params.id);

    return sendResponse(res, {
      message: "Invoice fetched successfully",
      data: result.data
    });

  } catch (err) {
    return sendResponse(res, {
      success: false,
      status: 404,
      message: err.message
    });
  }
};

/* =========================================
   UPDATE INVOICE
========================================= */
exports.updateInvoice = async (req, res) => {
  try {
    validateObjectId(req.params.id);

    const result = await service.updateInvoice(req.params.id, req.body);

    return sendResponse(res, {
      message: "Invoice updated successfully",
      data: result.data
    });

  } catch (err) {
    return sendResponse(res, {
      success: false,
      status: 400,
      message: err.message
    });
  }
};

/* =========================================
   DELETE INVOICE
========================================= */
exports.deleteInvoice = async (req, res) => {
  try {
    validateObjectId(req.params.id);

    const result = await service.deleteInvoice(req.params.id);

    return sendResponse(res, {
      message: result.message
    });

  } catch (err) {
    return sendResponse(res, {
      success: false,
      status: 404,
      message: err.message
    });
  }
};

/* =========================================
   COMMON PDF GENERATOR (REUSABLE)
========================================= */
const streamInvoicePDF = async (res, invoice, isDownload = false) => {
  try {
    // ✅ Convert mongoose → plain object
    const plainInvoice =
      typeof invoice?.toObject === "function"
        ? invoice.toObject()
        : invoice;

    // ✅ HARD SAFETY CHECK
    if (!plainInvoice || typeof plainInvoice !== "object") {
      throw new Error("Invalid invoice data for PDF");
    }

    // ✅ DEBUG (REMOVE AFTER TEST)
    console.log("PDF DATA CHECK:", plainInvoice.customer);

    // ✅ CREATE ELEMENT (NO JSX)
    const element = React.createElement(InvoicePDF, {
      invoice: plainInvoice
    });

    if (!element) {
      throw new Error("React element creation failed");
    }

    // ✅ RENDER STREAM
    const stream = await ReactPDF.renderToStream(element);

    // ✅ HEADERS
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${isDownload ? "attachment" : "inline"}; filename=${
        plainInvoice.invoiceNumber || "invoice"
      }.pdf`
    );

    // ✅ PIPE RESPONSE
    stream.pipe(res);

    stream.on("end", () => {
      res.end();
    });

    stream.on("error", (err) => {
      console.error("PDF STREAM ERROR:", err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "PDF stream failed"
        });
      }
    });

  } catch (error) {
    console.error("STREAM FUNCTION ERROR:", error);
    throw error;
  }
};

/* =========================================
   VIEW PDF (INLINE)
========================================= */
exports.generateInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    validateObjectId(id);

    const invoiceDoc = await service.getInvoiceForPDF(id);

    if (!invoiceDoc) {
      return sendResponse(res, {
        success: false,
        status: 404,
        message: "Invoice not found"
      });
    }

    // ✅ USE COMMON FUNCTION
    await streamInvoicePDF(res, invoiceDoc, false);

  } catch (err) {
    console.error("PDF ERROR:", err);

    return sendResponse(res, {
      success: false,
      status: 500,
      message: err.message
    });
  }
};

/* =========================================
   DOWNLOAD INVOICE PDF
========================================= */
/* =========================================
   DOWNLOAD PDF (UPDATED VERSION)
   ✅ Bill To always populated
========================================= */
// controllers/invoiceController.js
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    const React = require("react");
    const ReactPDF = require("@react-pdf/renderer");
    const InvoicePDF = require("./invoice.pdf").default;

    // 1️⃣ FETCH INVOICE (lean for plain object)
    let invoice = await Invoice.findById(id).lean();
    if (!invoice) throw new Error("Invoice not found");

    // 2️⃣ ENSURE CUSTOMER EXISTS (use real data if present)
    invoice.customer =
      invoice.customer && Object.keys(invoice.customer).length > 0
        ? invoice.customer
        : invoice.client || invoice.customerDetails || {
            name: "",
            address: "",
            email: "",
            phone: ""
          };

    // 3️⃣ CALCULATE TOTALS
    let subtotal = 0;
    let tax = 0;

    (invoice.items || []).forEach((item) => {
      subtotal += Number(item.value || 0);
      tax += Number(item.igstAmount || 0);
    });

    invoice.subtotal = invoice.subtotal ?? subtotal;
    invoice.totalTax = invoice.totalTax ?? tax;
    invoice.grandTotal =
      invoice.grandTotal ?? invoice.totalAmount ?? subtotal + tax;

    // 4️⃣ DEBUG (optional)
    console.log("FINAL PDF DATA:", invoice);

    // 5️⃣ CREATE PDF ELEMENT
    const element = React.createElement(InvoicePDF, { invoice });

    // 6️⃣ GENERATE PDF STREAM
    const stream = await ReactPDF.renderToStream(element);

    // 7️⃣ SET HEADERS
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber || "invoice"}.pdf`
    );

    // 8️⃣ PIPE PDF TO RESPONSE
    stream.pipe(res);
    stream.on("end", () => res.end());
    stream.on("error", (err) => {
      console.error("PDF STREAM ERROR:", err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "PDF generation failed" });
      }
    });

  } catch (err) {
    console.error("PDF ERROR:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};