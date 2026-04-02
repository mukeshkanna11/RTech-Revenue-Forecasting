const service = require("./invoice.service");
const ReactPDF = require("@react-pdf/renderer");
const InvoicePDF = require("./invoice.pdf");
const React = require("react");

/* =========================================
   RESPONSE HELPER (STANDARD FORMAT)
========================================= */
const sendResponse = (res, { success = true, status = 200, message, data }) => {
  res.status(status).json({
    success,
    message,
    data
  });
};

/* =========================================
   CREATE INVOICE
========================================= */
exports.createInvoice = async (req, res) => {
  try {
    const data = await service.createInvoice(req.body);

    return sendResponse(res, {
      message: "Invoice created successfully",
      data
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
   GET ALL INVOICES (PAGINATION + SEARCH)
========================================= */
exports.getInvoices = async (req, res) => {
  try {
    const data = await service.getAllInvoices(req.query);

    return sendResponse(res, {
      message: "Invoices fetched successfully",
      data
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
    const data = await service.getInvoiceById(req.params.id);

    return sendResponse(res, {
      message: "Invoice fetched successfully",
      data
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
    const data = await service.updateInvoice(req.params.id, req.body);

    return sendResponse(res, {
      message: "Invoice updated successfully",
      data
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
    await service.deleteInvoice(req.params.id);

    return sendResponse(res, {
      message: "Invoice deleted successfully"
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
   DOWNLOAD PDF (🔥 IMPORTANT FIXED)
========================================= */


exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    /* ==============================
       VALIDATION
    ============================== */
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required"
      });
    }

    /* ==============================
       FETCH INVOICE
    ============================== */
    const invoice = await service.getInvoiceById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    /* ==============================
       GENERATE PDF (REACT PDF ✅)
    ============================== */
    const element = React.createElement(InvoicePDF, {
      data: invoice
    });

    const stream = await ReactPDF.renderToStream(element);

    /* ==============================
       HEADERS
    ============================== */
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${invoice.invoiceNumber}.pdf`
    });

    /* ==============================
       STREAM RESPONSE
    ============================== */
    stream.pipe(res);

  } catch (err) {
    console.error("PDF DOWNLOAD ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error"
    });
  }
};