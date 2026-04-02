const React = require("react");
const {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} = require("@react-pdf/renderer");

/* =========================================
   STYLES
========================================= */
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10
  },
  section: {
    marginBottom: 8
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid black",
    marginTop: 10,
    paddingBottom: 4
  },
  tableRow: {
    flexDirection: "row",
    marginTop: 4
  },
  col: {
    flex: 1
  }
});

/* =========================================
   COMPONENT
========================================= */
const InvoicePDF = ({ data }) => {
  if (!data) return null;

  const s = data.supplier || {};
  const r = data.remittance || {};

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      /* TITLE */
      React.createElement(Text, { style: styles.title }, "TAX INVOICE"),

      /* INVOICE DETAILS */
      React.createElement(View, { style: styles.section },
        React.createElement(Text, null, `Invoice No: ${data.invoiceNumber}`),
        React.createElement(Text, null, `Invoice Date: ${new Date(data.invoiceDate).toLocaleDateString()}`),
        React.createElement(Text, null, `PO No: ${data.agreementPO?.number || "-"}`),
        React.createElement(Text, null, `PO Date: ${data.agreementPO?.date ? new Date(data.agreementPO.date).toLocaleDateString() : "-"}`),
        React.createElement(Text, null, `Service Mode: ${data.serviceMode}`)
      ),

      /* SUPPLIER */
      React.createElement(View, { style: styles.section },
        React.createElement(Text, null, `Supplier: ${s.name}`),
        React.createElement(Text, null, `GSTIN: ${s.gstin}`),
        React.createElement(Text, null, `CIN: ${s.cin}`),
        React.createElement(Text, null, `PAN: ${s.pan}`),
        React.createElement(Text, null, `IEC: ${s.iec}`),
        React.createElement(Text, null, `Email: ${s.email}`),
        React.createElement(Text, null, `Phone: ${s.phone}`)
      ),

      /* CUSTOMER */
      React.createElement(View, { style: styles.section },
        React.createElement(Text, null, `Customer: ${data.clientId?.name || "-"}`),
        React.createElement(Text, null, `Address: ${data.clientId?.address || "-"}`)
      ),

      /* TABLE HEADER */
      React.createElement(View, { style: styles.tableHeader },
        ["S.No", "Description", "HSN", "Value", "IGST%", "Tax", "Total"].map((h, i) =>
          React.createElement(Text, { key: i, style: styles.col }, h)
        )
      ),

      /* TABLE ROWS */
      (data.items || []).map((item, i) =>
        React.createElement(View, { style: styles.tableRow, key: i },
          React.createElement(Text, { style: styles.col }, i + 1),
          React.createElement(Text, { style: styles.col }, item.description),
          React.createElement(Text, { style: styles.col }, item.hsn),
          React.createElement(Text, { style: styles.col }, item.value),
          React.createElement(Text, { style: styles.col }, `${item.igstRate}%`),
          React.createElement(Text, { style: styles.col }, item.igstAmount),
          React.createElement(Text, { style: styles.col }, item.total)
        )
      ),

      /* TOTAL */
      React.createElement(View, { style: styles.section },
        React.createElement(Text, null, `Grand Total: ₹ ${data.totalAmount}`)
      ),

      /* REMITTANCE */
      React.createElement(View, { style: styles.section },
        React.createElement(Text, null, "Remittance Instructions"),
        React.createElement(Text, null, `Beneficiary: ${r.beneficiaryName}`),
        React.createElement(Text, null, `Account: ${r.accountNumber}`),
        React.createElement(Text, null, `SWIFT: ${r.swiftCode}`),
        React.createElement(Text, null, `IFSC: ${r.ifscCode}`),
        React.createElement(Text, null, `Bank: ${r.bankAddress}`)
      ),

      /* REMARK */
      React.createElement(View, { style: styles.section },
        React.createElement(Text, null, `Remark: ${data.remark}`)
      )
    )
  );
};

module.exports = InvoicePDF;