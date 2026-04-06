import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const safe = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const formatCurrency = (v) =>
  `Rs. ${safe(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff"
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #1e40af",
    paddingBottom: 10,
    textAlign: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 4
  },
  company: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14
  },
  card: {
    width: "48%",
    padding: 12,
    border: "1px solid #d1d5db",
    borderRadius: 6
  },
  fullCard: {
    width: "100%",
    padding: 12,
    border: "1px solid #d1d5db",
    borderRadius: 6,
    marginBottom: 14
  },
  bold: {
    fontWeight: "bold",
    marginBottom: 4
  },
  label: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2
  },
  value: {
    fontSize: 10,
    marginBottom: 2
  },
  table: {
    marginTop: 12,
    border: "1px solid #d1d5db",
    borderRadius: 4,
    overflow: "hidden"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: "bold",
    textAlign: "center"
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottom: "1px solid #e5e7eb"
  },
  col1: { width: "6%", textAlign: "center" },
  col2: { width: "34%", textAlign: "left", paddingLeft: 4 },
  col3: { width: "10%", textAlign: "center" },
  col4: { width: "14%", textAlign: "right", paddingRight: 4 },
  col5: { width: "10%", textAlign: "center" },
  col6: { width: "13%", textAlign: "right", paddingRight: 4 },
  col7: { width: "13%", textAlign: "right", paddingRight: 4 },
  totals: {
    marginTop: 16,
    padding: 12,
    border: "1px solid #1e40af",
    backgroundColor: "#f1f5f9",
    borderRadius: 6
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  grand: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e40af"
  },
  remittanceTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1e40af"
  },
  remittanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2
  }
});

export default function InvoicePDF({ invoice }) {
  if (!invoice)
    return (
      <Document>
        <Page>
          <Text>No Invoice Data</Text>
        </Page>
      </Document>
    );

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const customer = invoice.customer || {};
  const supplier = invoice.supplier || {};
  const remittance = invoice.remittance || {};

  let calcSubtotal = 0,
    calcTax = 0;
  items.forEach((i) => {
    calcSubtotal += safe(i.value);
    calcTax += safe(i.igstAmount);
  });

  const subtotal = safe(invoice.subtotal ?? calcSubtotal);
  const tax = safe(invoice.totalTax ?? calcTax);
  const grandTotal = safe(invoice.grandTotal ?? invoice.totalAmount ?? subtotal + tax);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>TAX INVOICE</Text>
          <Text style={styles.company}>{supplier.name || ""}</Text>
        </View>

        {/* Supplier & Invoice Details */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.bold}>Supplier</Text>
            <Text style={styles.value}>{supplier.name || ""}</Text>
            {supplier.gstin && <Text style={styles.label}>GSTIN: {supplier.gstin}</Text>}
            {supplier.pan && <Text style={styles.label}>PAN: {supplier.pan}</Text>}
            {supplier.phone && <Text style={styles.label}>Phone: {supplier.phone}</Text>}
            {supplier.email && <Text style={styles.label}>Email: {supplier.email}</Text>}
          </View>

          <View style={styles.card}>
            <Text style={styles.bold}>Invoice Details</Text>
            <Text style={styles.value}>No: {invoice.invoiceNumber || ""}</Text>
            {invoice.invoiceDate && (
              <Text style={styles.label}>Date: {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</Text>
            )}
            {invoice.agreementPO?.number && <Text style={styles.label}>PO: {invoice.agreementPO.number}</Text>}
          </View>
        </View>

        {/* Customer */}
        <View style={styles.fullCard}>
          <Text style={styles.bold}>Bill To</Text>
          <Text style={styles.value}>{customer.name || ""}</Text>
          <Text style={styles.label}>{customer.address || ""}</Text>
          <Text style={styles.label}>Phone: {customer.phone || ""}</Text>
          <Text style={styles.label}>Email: {customer.email || ""}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>Description</Text>
            <Text style={styles.col3}>HSN</Text>
            <Text style={styles.col4}>Value</Text>
            <Text style={styles.col5}>GST%</Text>
            <Text style={styles.col6}>Tax</Text>
            <Text style={styles.col7}>Total</Text>
          </View>
          {items.map((i, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.col1}>{idx + 1}</Text>
              <Text style={styles.col2}>{i.description || ""}</Text>
              <Text style={styles.col3}>{i.hsn || ""}</Text>
              <Text style={styles.col4}>{formatCurrency(i.value)}</Text>
              <Text style={styles.col5}>{safe(i.igstRate)}%</Text>
              <Text style={styles.col6}>{formatCurrency(i.igstAmount)}</Text>
              <Text style={styles.col7}>{formatCurrency(i.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax</Text>
            <Text>{formatCurrency(tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grand}>Grand Total</Text>
            <Text style={styles.grand}>{formatCurrency(grandTotal)}</Text>
          </View>
        </View>

        {/* Remittance */}
        <View style={styles.fullCard}>
          <Text style={styles.remittanceTitle}>Remittance / Bank Details</Text>
          <View style={styles.remittanceRow}>
            <Text>Beneficiary:</Text>
            <Text>{remittance.beneficiaryName || ""}</Text>
          </View>
          <View style={styles.remittanceRow}>
            <Text>Account No:</Text>
            <Text>{remittance.accountNumber || ""}</Text>
          </View>
          <View style={styles.remittanceRow}>
            <Text>IFSC:</Text>
            <Text>{remittance.ifscCode || ""}</Text>
          </View>
          <View style={styles.remittanceRow}>
            <Text>SWIFT:</Text>
            <Text>{remittance.swiftCode || ""}</Text>
          </View>
          <View style={styles.remittanceRow}>
            <Text>Bank Address:</Text>
            <Text>{remittance.bankAddress || ""}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}