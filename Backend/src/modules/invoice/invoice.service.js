const Invoice = require("./invoice.model");

/* =========================================
   HELPER: CALCULATE ITEMS
========================================= */
const calculateItems = (items = []) => {
  let total = 0;

  const updatedItems = items.map((item) => {
    const value = Number(item.value || 0);
    const rate = Number(item.igstRate || 0);

    const igstAmount = (value * rate) / 100;
    const totalItem = value + igstAmount;

    total += totalItem;

    return {
      description: item.description,
      hsn: item.hsn,
      value,
      igstRate: rate,
      igstAmount,
      total: totalItem
    };
  });

  return { updatedItems, total };
};

/* =========================================
   CREATE INVOICE
========================================= */
exports.createInvoice = async (body) => {
  if (!body.clientId) throw new Error("Client is required");
  if (!body.items || !body.items.length)
    throw new Error("At least one item is required");

  const { updatedItems, total } = calculateItems(body.items);

  const invoice = await Invoice.create({
    ...body,
    items: updatedItems,
    totalAmount: total
  });

  return invoice;
};

/* =========================================
   GET ALL INVOICES (PAGINATION + SEARCH)
========================================= */
exports.getAllInvoices = async ({
  page = 1,
  limit = 10,
  search = ""
}) => {
  const query = {};

  if (search) {
    query.invoiceNumber = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Invoice.find(query)
      .populate("clientId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Invoice.countDocuments(query)
  ]);

  return {
    data,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

/* =========================================
   GET SINGLE INVOICE
========================================= */
exports.getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id).populate("clientId");

  if (!invoice) throw new Error("Invoice not found");

  return invoice;
};

/* =========================================
   UPDATE INVOICE
========================================= */
exports.updateInvoice = async (id, body) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new Error("Invoice not found");

  let updatedData = { ...body };

  if (body.items) {
    const { updatedItems, total } = calculateItems(body.items);
    updatedData.items = updatedItems;
    updatedData.totalAmount = total;
  }

  const updatedInvoice = await Invoice.findByIdAndUpdate(
    id,
    updatedData,
    { new: true, runValidators: true }
  );

  return updatedInvoice;
};

/* =========================================
   DELETE INVOICE
========================================= */
exports.deleteInvoice = async (id) => {
  const invoice = await Invoice.findById(id);

  if (!invoice) throw new Error("Invoice not found");

  await Invoice.findByIdAndDelete(id);

  return { message: "Invoice deleted successfully" };
};

/* =========================================
   DOWNLOAD PDF (RETURN DATA)
========================================= */
exports.getInvoiceForPDF = async (id) => {
  const invoice = await Invoice.findById(id).populate("clientId");

  if (!invoice) throw new Error("Invoice not found");

  return invoice;
};