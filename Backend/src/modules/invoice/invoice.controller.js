const InvoiceService = require("./invoice.service");

/**
 * Create a new invoice
 */
exports.createInvoice = async (req, res) => {
  try {
    const invoice = await InvoiceService.createInvoice(req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Get all invoices
 */
exports.getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = "-invoiceDate" } = req.query;
    const data = await InvoiceService.getInvoices({}, parseInt(page), parseInt(limit), sortBy);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get single invoice by ID
 */
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await InvoiceService.getInvoiceById(req.params.id);
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * Update an invoice by ID
 */
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await InvoiceService.updateInvoice(req.params.id, req.body);
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Soft delete an invoice by ID
 */
exports.deleteInvoice = async (req, res) => {
  try {
    await InvoiceService.deleteInvoice(req.params.id);
    res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * Search invoices by keyword
 */
exports.searchInvoices = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;
    const data = await InvoiceService.searchInvoices(keyword, parseInt(page), parseInt(limit));
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};