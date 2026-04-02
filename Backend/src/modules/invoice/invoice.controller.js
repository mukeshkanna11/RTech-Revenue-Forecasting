const mongoose = require("mongoose");
const { PDFDocument, StandardFonts } = require("pdf-lib"); // For Node PDF generation
const service = require("./invoice.service");
const ReactPDF = require("@react-pdf/renderer"); // Keep if you want React PDF later
const InvoicePDF = require("./invoice.pdf"); // Your React PDF component
const React = require("react");
const Invoice = require("./invoice.model");

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
    const invoiceData = { ...req.body }; // use all fields from body
    const invoice = await Invoice.create(invoiceData); // create invoice

    return sendResponse(res, {
      message: "Invoice created successfully",
      data: invoice
    });
  } catch (error) {
    return sendResponse(res, {
      success: false,
      status: 400,
      message: error.message,
      data: error
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
   GENERATE INVOICE PDF (Node-safe)
========================================= */
const generateInvoicePDFBuffer = async (invoice) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 750;
  const clientName = invoice.clientId?.name || "Unknown Client";

  page.drawText(`Invoice: ${invoice.invoiceNumber || "INV-XXXX"}`, { x: 50, y, size: 20, font });
  y -= 40;
  page.drawText(`Client: ${clientName}`, { x: 50, y, size: 14, font });
  y -= 20;
  page.drawText(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { x: 50, y, size: 14, font });
  y -= 30;

  page.drawText("Items:", { x: 50, y, size: 14, font });
  y -= 20;

  if (invoice.items && invoice.items.length > 0) {
    invoice.items.forEach((item) => {
      page.drawText(`${item.name} - Qty: ${item.quantity} - Rs ${item.amount}`, { x: 60, y, size: 12, font });
      y -= 20;
    });
  } else {
    page.drawText("No items added.", { x: 60, y, size: 12, font });
    y -= 20;
  }

  const total = (invoice.items || []).reduce((sum, i) => sum + i.amount, 0);
  y -= 10;
  page.drawText(`Total: Rs ${total}`, { x: 50, y, size: 14, font });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

/* ---------------- PDF ROUTE ---------------- */
exports.generateInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid invoice ID" });

    // Fetch invoice with client info
    const invoice = await Invoice.findById(id).populate("clientId");
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    // Compute taxes if not already done
    if (invoice.items && invoice.items.length > 0) {
      invoice.items = invoice.items.map(item => {
        if (item.igstAmount == null || item.total == null) {
          const igstAmount = Math.round((item.value * (item.igstRate || 0)) / 100);
          const total = item.value + igstAmount;
          return { ...item, igstAmount, total };
        }
        return item;
      });
      invoice.totalAmount = invoice.items.reduce((sum, item) => sum + item.total, 0);
    }

    // Render PDF using ReactPDF
    const element = React.createElement(InvoicePDF, { data: invoice });
    const pdfStream = await ReactPDF.renderToStream(element);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${invoice.invoiceNumber || "invoice"}.pdf`);

    pdfStream.pipe(res);
    pdfStream.on("end", () => res.end());
    pdfStream.on("error", err => {
      console.error("PDF Stream Error:", err);
      res.status(500).json({ success: false, message: "PDF generation failed" });
    });

  } catch (err) {
    console.error("PDF DOWNLOAD ERROR:", err);
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};

/* =========================================
   DOWNLOAD INVOICE PDF (ReactPDF-safe)
========================================= */
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) 
      return res.status(400).json({ success: false, message: "Invoice ID required" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid invoice ID" });
    }

    const invoice = await Invoice.findById(id).populate("clientId");
    if (!invoice) 
      return res.status(404).json({ success: false, message: "Invoice not found" });

    // Safe ReactPDF rendering
    const element = React.createElement(InvoicePDF, { data: invoice });
    const pdfStream = await ReactPDF.renderToStream(element);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${invoice.invoiceNumber || "invoice"}.pdf`);

    pdfStream.pipe(res);
    pdfStream.on("end", () => res.end());
    pdfStream.on("error", (err) => {
      console.error("PDF Stream Error:", err);
      res.status(500).json({ success: false, message: "PDF generation failed" });
    });

  } catch (err) {
    console.error("PDF DOWNLOAD ERROR:", err);
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};