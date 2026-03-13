const mongoose = require("mongoose");
const Invoice = require("./invoice.model");
const generateInvoicePDF = require("./invoice.pdf");
const sendInvoiceEmail = require("./invoice.email");

/* ===================================================
   SAFE INVOICE NUMBER GENERATOR (NO DUPLICATES)
=================================================== */

const Counter = require("./counter.model");   // ✅ correct

const generateInvoiceNumber = async () => {

  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { name: `invoice-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.seq).padStart(4, "0");

  return `INV-${year}-${number}`;
};

/* ===================================================
   CALCULATE TOTALS
=================================================== */

const calculateTotals = (items = [], discount = 0) => {

  let subTotal = 0;
  let totalTaxAmount = 0;

  const updatedItems = items.map((item) => {

    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const itemDiscount = Number(item.discount) || 0;
    const taxPercent = Number(item.taxPercent) || 0;

    const base = quantity * price - itemDiscount;

    const taxAmount = (base * taxPercent) / 100;

    const total = base + taxAmount;

    subTotal += base;
    totalTaxAmount += taxAmount;

    return {
      ...item,
      taxAmount,
      total
    };

  });

  const grandTotal = subTotal - discount + totalTaxAmount;

  return {
    items: updatedItems,
    subTotal,
    totalTaxAmount,
    grandTotal
  };
};

/* ===================================================
   CREATE INVOICE
=================================================== */

const createInvoice = async (payload) => {

  const session = await mongoose.startSession();

  try {

    session.startTransaction();

    /* ---------- VALIDATION ---------- */

    if (!payload.client) {
      throw new Error("Client is required");
    }

    if (!payload.items || payload.items.length === 0) {
      throw new Error("Invoice must contain items");
    }

    /* ---------- GENERATE INVOICE NUMBER ---------- */

    const invoiceNumber = await generateInvoiceNumber(); // atomic counter

    /* ---------- CALCULATE TOTALS ---------- */

    const totals = calculateTotals(
      payload.items,
      payload.discount || 0
    );

    /* ---------- CREATE INVOICE ---------- */

    const invoice = new Invoice({
      ...payload,
      invoiceNumber,
      items: totals.items,
      subTotal: totals.subTotal,
      totalTaxAmount: totals.totalTaxAmount,
      grandTotal: totals.grandTotal
    });

    await invoice.save({ session });

    /* ---------- COMMIT ---------- */

    await session.commitTransaction();

    return invoice;

  } catch (err) {

    await session.abortTransaction();

    if (err.code === 11000) {
      throw new Error("Duplicate invoice number detected");
    }

    throw err;

  } finally {

    session.endSession();

  }

};

/* ===================================================
   GET INVOICES (Pagination + Search)
=================================================== */

const getInvoices = async ({
  page = 1,
  limit = 10,
  search = "",
  status
}) => {

  const query = { isDeleted: false };

  if (status) query.status = status;

  if (search) {

    query.$or = [
      { invoiceNumber: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } }
    ];

  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([

    Invoice.find(query)
      .populate("client", "name companyName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Invoice.countDocuments(query)

  ]);

  return {
    data,
    total,
    page,
    pages: Math.ceil(total / limit)
  };

};

/* ===================================================
   GET SINGLE INVOICE
=================================================== */

const getInvoiceById = async (id) => {

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid invoice id");

  const invoice = await Invoice.findOne({
    _id: id,
    isDeleted: false
  })
    .populate("client")
    .lean();

  return invoice;
};

/* ===================================================
   UPDATE INVOICE
=================================================== */

const updateInvoice = async (id, payload) => {

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid invoice id");

  if (payload.items) {

    const totals = calculateTotals(payload.items, payload.discount);

    payload.items = totals.items;
    payload.subTotal = totals.subTotal;
    payload.totalTaxAmount = totals.totalTaxAmount;
    payload.grandTotal = totals.grandTotal;

  }

  return Invoice.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  ).lean();

};

/* ===================================================
   UPDATE STATUS
=================================================== */

const updateInvoiceStatus = async (id, status) => {

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid invoice id");

  return Invoice.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { status },
    { new: true }
  ).lean();

};

/* ===================================================
   SOFT DELETE
=================================================== */

const deleteInvoice = async (id) => {

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid invoice id");

  return Invoice.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

};

/* ===================================================
   DOWNLOAD PDF
=================================================== */

const downloadInvoicePDF = async (id) => {

  const invoice = await getInvoiceById(id);

  if (!invoice)
    throw new Error("Invoice not found");

  const pdf = await generateInvoicePDF(invoice);

  return { invoice, pdf };

};

/* ===================================================
   EMAIL INVOICE
=================================================== */

const emailInvoice = async (id) => {

  const invoice = await getInvoiceById(id);

  if (!invoice)
    throw new Error("Invoice not found");

  const pdf = await generateInvoicePDF(invoice);

  await sendInvoiceEmail(invoice, pdf);

  return invoice;

};

/* ===================================================
   INVOICE STATS
=================================================== */

const getInvoiceStats = async () => {

  return Invoice.aggregate([

    { $match: { isDeleted: false } },

    {
      $group: {
        _id: "$status",
        totalAmount: { $sum: "$grandTotal" },
        count: { $sum: 1 }
      }
    },

    {
      $project: {
        status: "$_id",
        totalAmount: 1,
        count: 1,
        _id: 0
      }
    }

  ]);

};

/* ===================================================
   REVENUE ANALYTICS
=================================================== */

const getRevenueAnalytics = async () => {

  return Invoice.aggregate([

    { $match: { isDeleted: false } },

    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        revenue: { $sum: "$grandTotal" },
        invoices: { $sum: 1 }
      }
    },

    {
      $project: {
        year: "$_id.year",
        month: "$_id.month",
        revenue: 1,
        invoices: 1,
        _id: 0
      }
    },

    { $sort: { year: 1, month: 1 } }

  ]);

};

/* ===================================================
   EXPORTS
=================================================== */

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