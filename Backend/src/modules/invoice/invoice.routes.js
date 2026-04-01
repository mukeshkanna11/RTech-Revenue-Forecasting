const express = require("express");
const router = express.Router();
const invoiceController = require("./invoice.controller");
const generateInvoicePDF = require("./invoice.pdf");
const InvoiceService = require("./invoice.service");

// -------------------- Standard CRUD --------------------

// Create a new invoice
router.post("/", invoiceController.createInvoice);

// Get all invoices
router.get("/", invoiceController.getInvoices);

// Get single invoice by ID
router.get("/:id", invoiceController.getInvoiceById);

// Update invoice by ID
router.put("/:id", invoiceController.updateInvoice);

// Soft delete invoice by ID
router.delete("/:id", invoiceController.deleteInvoice);

// Search invoices
router.get("/search/:keyword", invoiceController.searchInvoices);

// -------------------- PDF Download --------------------

router.get("/download/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Fetch invoice and check if it exists
    const invoice = await InvoiceService.getInvoiceById(invoiceId);
    if (!invoice || invoice.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found or has been deleted",
      });
    }

    // Optional: server save path
    let savePath = null;
    if (req.query.save === "true") {
      const invoicesDir = path.join(__dirname, "../../invoices");
      if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

      // Sanitize file name
      const safeFileName = invoice.invoiceNumber.replace(/[^a-z0-9_\-]/gi, "_");
      savePath = path.join(invoicesDir, `${safeFileName}.pdf`);
    }

    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePDF(invoice, { filePath: savePath });

    // Set headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber || "invoice"}.pdf`
    );

    // Stream the PDF
    res.send(pdfBuffer);

    // Optional logging
    console.log(`Invoice ${invoice.invoiceNumber} downloaded by user at ${new Date().toISOString()}`);
  } catch (err) {
    console.error(`Error downloading invoice: ${err.message}`, err);
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice PDF. " + err.message,
    });
  }
});

module.exports = router;