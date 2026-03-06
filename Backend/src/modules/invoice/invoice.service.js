const Invoice = require("./invoice.model");

/* =====================================
   Generate Invoice Number
===================================== */

const generateInvoiceNumber = async () => {

  const year = new Date().getFullYear();

  const lastInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `INV-${year}` }
  }).sort({ createdAt: -1 });

  if (!lastInvoice) return `INV-${year}-0001`;

  const lastNumber = parseInt(
    lastInvoice.invoiceNumber.split("-")[2]
  );

  const newNumber = String(lastNumber + 1).padStart(4, "0");

  return `INV-${year}-${newNumber}`;
};


/* =====================================
   Calculate Invoice Totals
===================================== */

const calculateTotals = (items = [], discount = 0) => {

  let subTotal = 0;
  let totalTaxAmount = 0;

  items.forEach((item) => {

    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const itemDiscount = Number(item.discount) || 0;
    const taxPercent = Number(item.taxPercent) || 0;

    const base = qty * price - itemDiscount;

    const taxAmount = (base * taxPercent) / 100;

    item.total = base + taxAmount;

    subTotal += base;
    totalTaxAmount += taxAmount;
  });

  const grandTotal = subTotal - discount + totalTaxAmount;

  return {
    items,
    subTotal,
    totalTaxAmount,
    grandTotal
  };
};


/* =====================================
   Create Invoice
===================================== */

const createInvoice = async (payload) => {

  const invoiceNumber = await generateInvoiceNumber();

  const totals = calculateTotals(
    payload.items,
    payload.discount
  );

  const invoiceData = {
    ...payload,
    invoiceNumber,
    items: totals.items,
    subTotal: totals.subTotal,
    totalTaxAmount: totals.totalTaxAmount,
    grandTotal: totals.grandTotal
  };

  return Invoice.create(invoiceData);
};


/* =====================================
   Get All Invoices
===================================== */

const getInvoices = async ({
  page = 1,
  limit = 10,
  search = "",
  status
}) => {

  const query = { isDeleted: false };

  if (status) query.status = status;

  if (search) {
    query.invoiceNumber = {
      $regex: search,
      $options: "i"
    };
  }

  const invoices = await Invoice.find(query)
    .populate("client", "name companyName email")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Invoice.countDocuments(query);

  return {
    data: invoices,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  };
};


/* =====================================
   Get Invoice By ID
===================================== */

const getInvoiceById = async (id) => {

  return Invoice.findOne({
    _id: id,
    isDeleted: false
  }).populate("client");
};


/* =====================================
   Update Invoice
===================================== */

const updateInvoice = async (id, payload) => {

  if (payload.items) {

    const totals = calculateTotals(
      payload.items,
      payload.discount
    );

    payload.items = totals.items;
    payload.subTotal = totals.subTotal;
    payload.totalTaxAmount = totals.totalTaxAmount;
    payload.grandTotal = totals.grandTotal;
  }

  return Invoice.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  );
};


/* =====================================
   Delete Invoice (Soft Delete)
===================================== */

const deleteInvoice = async (id) => {

  return Invoice.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
};


/* =====================================
   Update Status
===================================== */

const updateInvoiceStatus = async (id, status) => {

  return Invoice.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { status },
    { new: true }
  );
};


module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus
};