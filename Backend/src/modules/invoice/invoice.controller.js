const invoiceService = require("./invoice.service");
const catchAsync = require("../../utils/catchAsync");
const ApiError = require("../../utils/ApiError");
const Invoice = require("./invoice.model");

/* ================= CREATE INVOICE ================= */

const createInvoice = catchAsync(async (req, res) => {

  const body = req.body;

  /* ===== VALIDATIONS ===== */

  if (!body.client) {
    throw new ApiError(400, "Client is required");
  }

  if (!body.items || body.items.length === 0) {
    throw new ApiError(400, "Invoice must contain at least one item");
  }

  /* ===== SANITIZE PAYMENT METHOD ===== */

  if (body.paymentMethod) {
    body.paymentMethod = body.paymentMethod.toLowerCase();
  }

  /* ===== GENERATE INVOICE NUMBER ===== */

  const lastInvoice = await Invoice
    .findOne()
    .sort({ createdAt: -1 })
    .select("invoiceNumber");

  let invoiceNumber = "INV-0001";

  if (lastInvoice) {

    const lastNumber = parseInt(
      lastInvoice.invoiceNumber.split("-")[1]
    );

    invoiceNumber = `INV-${String(lastNumber + 1).padStart(4, "0")}`;

  }

  /* ===== BUILD PAYLOAD ===== */

  const payload = {
    ...body,
    invoiceNumber,
    createdBy: req.user?.id
  };

  /* ===== CREATE ===== */

  const invoice = await invoiceService.createInvoice(payload);

  res.status(201).json({
    success: true,
    message: "Invoice created successfully",
    data: invoice
  });

});


/* ================= GET ALL ================= */

const getInvoices = catchAsync(async (req, res) => {

  const result = await invoiceService.getInvoices({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status
  });

  res.json({
    success: true,
    ...result
  });

});


/* ================= GET SINGLE ================= */

const getInvoiceById = catchAsync(async (req, res) => {

  const invoice = await invoiceService.getInvoiceById(req.params.id);

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  res.json({
    success: true,
    data: invoice
  });

});


/* ================= UPDATE ================= */

const updateInvoice = catchAsync(async (req, res) => {

  const body = req.body;

  if (body.paymentMethod) {
    body.paymentMethod = body.paymentMethod.toLowerCase();
  }

  const invoice = await invoiceService.updateInvoice(
    req.params.id,
    body
  );

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  res.json({
    success: true,
    message: "Invoice updated successfully",
    data: invoice
  });

});


/* ================= UPDATE STATUS ================= */

const updateInvoiceStatus = catchAsync(async (req, res) => {

  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const invoice = await invoiceService.updateInvoiceStatus(
    req.params.id,
    status
  );

  res.json({
    success: true,
    message: "Status updated",
    data: invoice
  });

});


/* ================= DELETE ================= */

const deleteInvoice = catchAsync(async (req, res) => {

  await invoiceService.deleteInvoice(req.params.id);

  res.json({
    success: true,
    message: "Invoice deleted successfully"
  });

});


/* ================= DOWNLOAD PDF ================= */

const downloadInvoicePDF = catchAsync(async (req, res) => {

  const { invoice, pdf } =
    await invoiceService.downloadInvoicePDF(req.params.id);

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${invoice.invoiceNumber}.pdf`
  );

  res.send(pdf);

});


/* ================= EMAIL INVOICE ================= */

const emailInvoice = catchAsync(async (req, res) => {

  await invoiceService.emailInvoice(req.params.id);

  res.json({
    success: true,
    message: "Invoice email sent successfully"
  });

});


/* ================= STATS ================= */

const getInvoiceStats = catchAsync(async (req, res) => {

  const stats = await invoiceService.getInvoiceStats();

  res.json({
    success: true,
    data: stats
  });

});


/* ================= REVENUE ANALYTICS ================= */

const getRevenueAnalytics = catchAsync(async (req, res) => {

  const data = await invoiceService.getRevenueAnalytics();

  res.json({
    success: true,
    data
  });

});


module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  downloadInvoicePDF,
  emailInvoice,
  getInvoiceStats,
  getRevenueAnalytics
};