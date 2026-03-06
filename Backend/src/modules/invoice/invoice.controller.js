const invoiceService = require("./invoice.service");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");

/**
 * =====================================
 * CREATE INVOICE
 * POST /api/v1/invoices
 * =====================================
 */
const createInvoice = catchAsync(async (req, res) => {

  const payload = {
    ...req.body,
    createdBy: req.user?.id || null
  };

  const invoice = await invoiceService.createInvoice(payload);

  res.status(201).json({
    success: true,
    message: "Invoice created successfully",
    data: invoice
  });

});


/**
 * =====================================
 * GET ALL INVOICES
 * GET /api/v1/invoices
 * =====================================
 */
const getInvoices = catchAsync(async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const search = req.query.search || "";
  const status = req.query.status;

  const invoices = await invoiceService.getInvoices({
    page,
    limit,
    search,
    status
  });

  res.status(200).json({
    success: true,
    message: "Invoices fetched successfully",
    ...invoices
  });

});


/**
 * =====================================
 * GET INVOICE BY ID
 * GET /api/v1/invoices/:id
 * =====================================
 */
const getInvoiceById = catchAsync(async (req, res) => {

  const invoice = await invoiceService.getInvoiceById(req.params.id);

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  res.status(200).json({
    success: true,
    data: invoice
  });

});


/**
 * =====================================
 * UPDATE INVOICE
 * PATCH /api/v1/invoices/:id
 * =====================================
 */
const updateInvoice = catchAsync(async (req, res) => {

  const invoice = await invoiceService.updateInvoice(
    req.params.id,
    req.body
  );

  if (!invoice) {
    throw new ApiError(404, "Invoice not found or already deleted");
  }

  res.status(200).json({
    success: true,
    message: "Invoice updated successfully",
    data: invoice
  });

});


/**
 * =====================================
 * UPDATE INVOICE STATUS
 * PATCH /api/v1/invoices/:id/status
 * =====================================
 */
const updateInvoiceStatus = catchAsync(async (req, res) => {

  const { status } = req.body;

  const invoice = await invoiceService.updateInvoiceStatus(
    req.params.id,
    status
  );

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  res.status(200).json({
    success: true,
    message: "Invoice status updated successfully",
    data: invoice
  });

});


/**
 * =====================================
 * DELETE INVOICE (SOFT DELETE)
 * DELETE /api/v1/invoices/:id
 * =====================================
 */
const deleteInvoice = catchAsync(async (req, res) => {

  const invoice = await invoiceService.deleteInvoice(req.params.id);

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  res.status(200).json({
    success: true,
    message: "Invoice deleted successfully"
  });

});


/**
 * =====================================
 * DOWNLOAD INVOICE PDF
 * GET /api/v1/invoices/:id/pdf
 * =====================================
 */
const downloadInvoicePDF = catchAsync(async (req, res) => {

  const invoice = await invoiceService.getInvoiceById(req.params.id);

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  res.status(200).json({
    success: true,
    message: "PDF generation route working",
    data: invoice
  });

});


module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  downloadInvoicePDF
};