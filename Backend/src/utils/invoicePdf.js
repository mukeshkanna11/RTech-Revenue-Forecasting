const PDFDocument = require("pdfkit");

const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument();

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("INVOICE", { align: "center" });

  doc.moveDown();

  doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
  doc.text(`Client: ${invoice.client.name}`);
  doc.text(`Total Amount: ₹${invoice.totalAmount}`);
  doc.text(`Status: ${invoice.status}`);

  doc.moveDown();

  doc.text("Items:");

  invoice.items.forEach((item) => {
    doc.text(
      `${item.name} - ${item.quantity} x ${item.price}`
    );
  });

  doc.end();
};

module.exports = generateInvoicePDF;