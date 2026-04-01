const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generate TAX Invoice PDF
 * @param {Object} invoice - Invoice document from MongoDB
 * @param {Object} options
 * @param {String} options.filePath - Optional: path to save PDF
 * @param {String} options.logoPath - Optional: path to supplier logo
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateInvoicePDF = async (invoice, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const { filePath, logoPath } = options;
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        if (filePath) fs.writeFileSync(filePath, pdfData);
        resolve(pdfData);
      });

      // Optional logo
      if (logoPath && fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 100 });
      }

      // Header
      doc.fontSize(20).text("TAX INVOICE", { align: "center", underline: true }).moveDown(1);

      // Supplier Info
      doc.fontSize(10)
        .text(`Supplier: ${invoice.supplier.name || "-"}`)
        .text(`GSTIN: ${invoice.supplier.gstin || "-"}`, { continued: true })
        .text(`   CIN: ${invoice.supplier.cin || "-"}`)
        .text(`IEC: ${invoice.supplier.iec || "-"}   IEC Date: ${invoice.supplier.iecDate ? invoice.supplier.iecDate.toLocaleDateString() : "-"}`)
        .text(`PAN: ${invoice.supplier.pan || "-"}`)
        .text(`Tel: ${invoice.supplier.tel || "-"}   Email: ${invoice.supplier.email || "-"}`)
        .moveDown(1);

      // Invoice Info
      doc.text(`Invoice No: ${invoice.invoiceNumber || "-"}`)
        .text(`Invoice Date: ${invoice.invoiceDate ? invoice.invoiceDate.toLocaleDateString() : "-"}`)
        .text(`Agreement/PO No: ${invoice.agreementPO?.number || "-"}`)
        .text(`Agreement PO Date: ${invoice.agreementPO?.date ? invoice.agreementPO.date.toLocaleDateString() : "-"}`)
        .moveDown(1);

      // Customer Info
      doc.text(`Customer: ${invoice.customer.name || "-"}`)
        .text(`Address: ${invoice.customer.address || "-"}`)
        .text(`Service Mode: ${invoice.customer.serviceMode || "Online / ITES"}`)
        .moveDown(1);

      // Items Table Header
      const tableHeaders = ["S No", "Description", "HSN", "Qty", "Rate", "Tax%", "Tax Amount", "Total"];
      const columnWidths = [40, 150, 50, 40, 60, 40, 70, 70];

      let startX = doc.x;
      tableHeaders.forEach((header, i) => {
        doc.text(header, startX, doc.y, { width: columnWidths[i], continued: i !== tableHeaders.length - 1 });
      });
      doc.moveDown(0.5);
      doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke(); // underline

      // Table Rows
      invoice.items.forEach((item, idx) => {
        let values = [
          idx + 1,
          item.description || "-",
          item.hsnCode || "-",
          item.quantity || 0,
          item.rate?.toFixed(2) || "0.00",
          item.taxPercent?.toFixed(2) || "0.00",
          item.taxAmount?.toFixed(2) || "0.00",
          item.total?.toFixed(2) || "0.00"
        ];
        values.forEach((val, i) => {
          doc.text(val.toString(), startX, doc.y, { width: columnWidths[i], continued: i !== values.length - 1 });
        });
        doc.moveDown(0.5);
      });

      doc.moveDown(1);

      // Totals
      doc.text(`Subtotal: ₹ ${invoice.subTotal?.toFixed(2) || "0.00"}`, { align: "right" })
        .text(`Total Tax: ₹ ${invoice.totalTaxAmount?.toFixed(2) || "0.00"}`, { align: "right" })
        .text(`Grand Total: ₹ ${invoice.grandTotal?.toFixed(2) || "0.00"}`, { align: "right" })
        .text(`In Words: ${invoice.amountInWords || "-"}`, { align: "right" })
        .moveDown(1);

      // Remittance
      doc.text("Remittance Instructions:", { underline: true })
        .text(`Beneficiary Name: ${invoice.remittance.beneficiaryName || "-"}`)
        .text(`Account Number: ${invoice.remittance.accountNumber || "-"}`)
        .text(`SWIFT Code: ${invoice.remittance.swiftCode || "-"}`)
        .text(`IFS Code: ${invoice.remittance.ifsCode || "-"}`)
        .text(`Bank Address: ${invoice.remittance.bankAddress || "-"}`)
        .moveDown(1);

      // Footer
      doc.text(`For ${invoice.supplier.name || "-"} PRIVATE LIMITED`, { align: "left" })
        .moveDown(4)
        .text("Authorised Signatory", { align: "left" })
        .moveDown(1)
        .text(`Remarks: ${invoice.remarks || "-"}`)
        .text(`TYPE OF CLEARANCE: ${invoice.typeOfClearance || "-"}`)
        .end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateInvoicePDF;