const Invoice = require("./invoice.model");
const Counter = require("./counter.model");
const { toWords } = require("number-to-words");

class InvoiceService {
  /**
   * Generate a unique invoice number (safe for SaaS multi-user)
   */
  static async generateInvoiceNumber() {
    try {
      let counter, invoiceNumberExists;
      const year = new Date().getFullYear();

      do {
        counter = await Counter.findByIdAndUpdate(
          { _id: "invoiceNumber" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );

        invoiceNumberExists = await Invoice.exists({ invoiceNumber: `INV-${year}-${String(counter.seq).padStart(4, "0")}` });
      } while (invoiceNumberExists);

      return `INV-${year}-${String(counter.seq).padStart(4, "0")}`;
    } catch (err) {
      throw new Error("Failed to generate invoice number: " + err.message);
    }
  }

  /**
   * Create a new invoice
   * @param {Object} data - Full invoice data
   */
  static async createInvoice(data) {
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Invoice must contain at least one item");
    }

    // Generate invoice number if not provided
    if (!data.invoiceNumber) {
      data.invoiceNumber = await this.generateInvoiceNumber();
    }

    // Calculate totals for each item
    data.items = data.items.map((item) => {
      const quantity = item.quantity || 1;
      const rate = item.rate || 0;
      const taxPercent = item.taxPercent || 0;

      const base = quantity * rate;
      const taxAmount = (base * taxPercent) / 100;
      const total = base + taxAmount;

      return { ...item, taxAmount, total };
    });

    // Calculate invoice totals
    const subTotal = data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const totalTaxAmount = data.items.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = subTotal + totalTaxAmount;

    data.subTotal = subTotal;
    data.totalTaxAmount = totalTaxAmount;
    data.grandTotal = grandTotal;
    data.amountInWords = toWords(grandTotal);

    // Default status
    data.status = data.status || "draft";

    const invoice = await Invoice.create(data);
    return invoice;
  }

  /**
   * Get invoices with pagination, filter, and sorting
   */
  static async getInvoices(filter = {}, page = 1, limit = 10, sortBy = "-invoiceDate") {
    const skip = (page - 1) * limit;
    const total = await Invoice.countDocuments(filter);

    const invoices = await Invoice.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortBy);

    return {
      invoices,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Get a single invoice by ID
   */
  static async getInvoiceById(id) {
    const invoice = await Invoice.findById(id);
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  }

  /**
   * Update an invoice
   */
  static async updateInvoice(id, data) {
    const invoice = await Invoice.findById(id);
    if (!invoice) throw new Error("Invoice not found");

    // Recalculate items if provided
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      data.items = data.items.map((item) => {
        const quantity = item.quantity || 1;
        const rate = item.rate || 0;
        const taxPercent = item.taxPercent || 0;

        const base = quantity * rate;
        const taxAmount = (base * taxPercent) / 100;
        const total = base + taxAmount;

        return { ...item, taxAmount, total };
      });

      // Update totals
      const subTotal = data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
      const totalTaxAmount = data.items.reduce((sum, item) => sum + item.taxAmount, 0);
      const grandTotal = subTotal + totalTaxAmount;

      data.subTotal = subTotal;
      data.totalTaxAmount = totalTaxAmount;
      data.grandTotal = grandTotal;
      data.amountInWords = toWords(grandTotal);
    }

    Object.assign(invoice, data);
    return await invoice.save();
  }

  /**
   * Soft delete an invoice
   */
  static async deleteInvoice(id) {
    const invoice = await Invoice.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  }

  /**
   * Search invoices by keyword
   */
  static async searchInvoices(keyword, page = 1, limit = 10) {
    const regex = new RegExp(keyword, "i");
    const filter = {
      $or: [
        { "customer.name": regex },
        { invoiceNumber: regex },
        { remarks: regex }
      ]
    };
    return this.getInvoices(filter, page, limit);
  }

  /**
   * Update invoice status
   */
  static async updateStatus(id, status) {
    const validStatuses = ["draft", "sent", "paid", "partial", "overdue"];
    if (!validStatuses.includes(status)) throw new Error("Invalid status");

    const invoice = await Invoice.findByIdAndUpdate(id, { status }, { new: true });
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  }
}

module.exports = InvoiceService;