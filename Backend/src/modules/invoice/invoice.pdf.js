const React = require("react");
const {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} = require("@react-pdf/renderer");

/* ================= SAFE HELPERS ================= */
const safe = (v) => (isNaN(Number(v)) ? 0 : Number(v));

const formatCurrency = (v) =>
  `₹ ${safe(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica"
  },

  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold"
  },

  section: {
    marginBottom: 10
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  box: {
    border: "1px solid #ccc",
    padding: 6,
    width: "48%"
  },

  bold: {
    fontWeight: "bold"
  },

  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid black",
    marginTop: 10,
    paddingBottom: 4,
    fontWeight: "bold"
  },

  tableRow: {
    flexDirection: "row",
    marginTop: 4
  },

  col: {
    flex: 1,
    fontSize: 9
  },

  totalBox: {
    marginTop: 10,
    padding: 6,
    border: "1px solid #000"
  }
});

/* ================= COMPONENT ================= */
const InvoicePDF = ({ invoice }) => {
  // ✅ NEVER return null
  if (!invoice) {
    return React.createElement(
      Document,
      null,
      React.createElement(Page, null,
        React.createElement(Text, null, "No Invoice Data")
      )
    );
  }

  const s = invoice.supplier || {};
  const r = invoice.remittance || {};
  const customer = invoice.customer || {}; // ✅ FIXED HERE
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      /* ===== TITLE ===== */
      React.createElement(Text, { style: styles.title }, "TAX INVOICE"),

      /* ===== TOP ROW ===== */
      React.createElement(View, { style: [styles.row, styles.section] },

        React.createElement(View, { style: styles.box },
          React.createElement(Text, { style: styles.bold }, "Supplier"),
          React.createElement(Text, null, s.name || "-"),
          React.createElement(Text, null, `GSTIN: ${s.gstin || "-"}`),
          React.createElement(Text, null, `PAN: ${s.pan || "-"}`),
          React.createElement(Text, null, `Phone: ${s.phone || "-"}`)
        ),

        React.createElement(View, { style: styles.box },
          React.createElement(Text, { style: styles.bold }, "Invoice Info"),
          React.createElement(Text, null, `No: ${invoice.invoiceNumber || "-"}`),
          React.createElement(Text, null,
            `Date: ${
              invoice.invoiceDate
                ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN")
                : "-"
            }`
          ),
          React.createElement(Text, null, `PO: ${invoice.agreementPO?.number || "-"}`)
        )
      ),

      //customer//

      React.createElement(View, { style: styles.section },
  React.createElement(Text, { style: styles.bold }, "Bill To"),
  React.createElement(Text, null, customer?.name || "-"),
  React.createElement(Text, null, customer?.address || "-"),
  React.createElement(Text, null, `Phone: ${customer?.phone || "-"}`),
  React.createElement(Text, null, `Email: ${customer?.email || "-"}`)
),

      /* ===== TABLE ===== */
      React.createElement(View, { style: styles.tableHeader },
        ["#", "Description", "HSN", "Value", "IGST%", "Tax", "Total"].map((h, i) =>
          React.createElement(Text, { key: i, style: styles.col }, h)
        )
      ),

      items.map((item, i) =>
        React.createElement(View, { style: styles.tableRow, key: i },
          React.createElement(Text, { style: styles.col }, i + 1),
          React.createElement(Text, { style: styles.col }, item.description || "-"),
          React.createElement(Text, { style: styles.col }, item.hsn || "-"),
          React.createElement(Text, { style: styles.col }, formatCurrency(item.value)),
          React.createElement(Text, { style: styles.col }, `${safe(item.igstRate)}%`),
          React.createElement(Text, { style: styles.col }, formatCurrency(item.igstAmount)),
          React.createElement(Text, { style: styles.col }, formatCurrency(item.total))
        )
      ),

      /* ===== TOTAL ===== */
      React.createElement(View, { style: styles.totalBox },
        React.createElement(Text, null, `Subtotal: ${formatCurrency(invoice.subtotal)}`),
        React.createElement(Text, null, `Tax: ${formatCurrency(invoice.totalTax)}`),
        React.createElement(Text, { style: styles.bold },
          `Grand Total: ${formatCurrency(invoice.grandTotal)}`
        )
      ),

      /* ===== REMITTANCE ===== */
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.bold }, "Bank Details"),
        React.createElement(Text, null, `Beneficiary: ${r.beneficiaryName || "-"}`),
        React.createElement(Text, null, `Account: ${r.accountNumber || "-"}`),
        React.createElement(Text, null, `IFSC: ${r.ifscCode || "-"}`)
      ),

      /* ===== REMARK ===== */
      React.createElement(View, { style: styles.section },
        React.createElement(Text, null, `Remark: ${invoice.remark || "-"}`)
      )
    )
  );
};

module.exports = InvoicePDF;