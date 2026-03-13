const PDFDocument = require("pdfkit");

const generateInvoicePDF = (invoice) => {

  const doc = new PDFDocument({ margin: 40 });

  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));

  return new Promise((resolve) => {

    doc.on("end", () => {

      const pdfData = Buffer.concat(buffers);

      resolve(pdfData);

    });

    doc.fontSize(20).text("INVOICE", { align: "center" });

    doc.moveDown();

    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Issue Date: ${invoice.issueDate}`);
    doc.text(`Status: ${invoice.status}`);

    doc.moveDown();

    doc.text(`Client: ${invoice.client.name}`);
    doc.text(`Company: ${invoice.client.companyName}`);
    doc.text(`Email: ${invoice.client.email}`);

    doc.moveDown();

    doc.text("Items", { underline: true });

    invoice.items.forEach((item) => {

      doc.text(
        `${item.description} - Qty:${item.quantity} - ₹${item.total}`
      );

    });

    doc.moveDown();

    doc.text(`Subtotal: ₹${invoice.subTotal}`);
    doc.text(`Tax: ₹${invoice.totalTaxAmount}`);
    doc.text(`Discount: ₹${invoice.discount}`);
    doc.text(`Grand Total: ₹${invoice.grandTotal}`);

    doc.end();

  });

};

module.exports = generateInvoicePDF;