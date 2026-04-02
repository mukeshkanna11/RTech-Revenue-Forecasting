import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import logo from "../../../assets/logo.png"; // Correct path

// Format currency
const formatCurrency = (value) => `₹${typeof value === "number" ? value.toFixed(2) : "0.00"}`;

// Styles
const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#f9f9f9" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  logo: { width: 120, height: 40 },
  companyInfo: { textAlign: "right", fontSize: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "#1B4F72", marginBottom: 4 },
  subtitle: { fontSize: 11, marginBottom: 2 },
  section: { marginTop: 12, padding: 8, backgroundColor: "#ffffff", borderRadius: 6 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 6, color: "#1B4F72", borderBottom: "1px solid #ccc", paddingBottom: 2 },
  row: { flexDirection: "row", borderBottom: "1px solid #eee", paddingVertical: 6, alignItems: "center" },
  headerRow: { flexDirection: "row", backgroundColor: "#1B4F72", color: "#fff", paddingVertical: 6, fontWeight: "bold" },
  col1: { width: "5%", textAlign: "center" },
  col2: { width: "35%", paddingLeft: 4 },
  col3: { width: "10%", textAlign: "center" },
  col4: { width: "10%", textAlign: "right" },
  col5: { width: "10%", textAlign: "center" },
  col6: { width: "10%", textAlign: "right" },
  col7: { width: "20%", textAlign: "right" },
  totalsWrapper: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalLabel: { fontWeight: "bold" },
  totalValue: { fontWeight: "bold" },
  remittance: { marginTop: 16, fontSize: 10, lineHeight: 1.4, padding: 8, backgroundColor: "#E8F6F3", borderRadius: 6 },
  footer: { marginTop: 20, fontSize: 9, textAlign: "center", color: "#555" },
});

// Main PDF
export default function InvoicePDF({ invoice }) {
  const client = invoice.client || invoice.clientId || {}; // Use clientId if client missing
  const items = invoice.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.value || 0), 0);
  const tax = items.reduce((sum, i) => sum + ((i.value || 0) * ((i.igstRate || 0) / 100)), 0);
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header: Logo & Supplier */}
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text style={{ fontWeight: "bold" }}>{invoice.supplier?.name || "-"}</Text>
            <Text>{invoice.supplier?.address || "-"}</Text>
            <Text>GSTIN: {invoice.supplier?.gstin || "-"}</Text>
            <Text>Email: {invoice.supplier?.email || "-"}</Text>
            <Text>Phone: {invoice.supplier?.phone || "-"}</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.section}>
          <Text style={styles.title}>TAX INVOICE</Text>
          <Text style={styles.subtitle}>Invoice No: {invoice.invoiceNumber}</Text>
          <Text style={styles.subtitle}>Invoice Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : "-"}</Text>
          <Text style={styles.subtitle}>PO No: {invoice.agreementPO?.number || "-"}</Text>
          <Text style={styles.subtitle}>PO Date: {invoice.agreementPO?.date ? new Date(invoice.agreementPO.date).toLocaleDateString() : "-"}</Text>
          <Text style={styles.subtitle}>Service Mode: {invoice.serviceMode || "-"}</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text>{client.companyName || client.name || "-"}</Text>
          <Text>Address: {client.address || "-"}</Text>
          <Text>Email: {client.email || "-"}</Text>
          <Text>Phone: {client.phone || "-"}</Text>
        </View>

        {/* Items Table */}
        <View style={[styles.section, { marginTop: 12 }]}>
          <View style={styles.headerRow}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>Description</Text>
            <Text style={styles.col3}>HSN</Text>
            <Text style={styles.col4}>Value</Text>
            <Text style={styles.col5}>IGST%</Text>
            <Text style={styles.col6}>Tax</Text>
            <Text style={styles.col7}>Total</Text>
          </View>

          {items.map((item, idx) => {
            const igstAmount = (item.value || 0) * ((item.igstRate || 0) / 100);
            const totalItem = (item.value || 0) + igstAmount;
            return (
              <View key={idx} style={styles.row}>
                <Text style={styles.col1}>{idx + 1}</Text>
                <Text style={styles.col2}>{item.description || "-"}</Text>
                <Text style={styles.col3}>{item.hsn || "-"}</Text>
                <Text style={styles.col4}>{formatCurrency(item.value)}</Text>
                <Text style={styles.col5}>{item.igstRate || 0}%</Text>
                <Text style={styles.col6}>{formatCurrency(igstAmount)}</Text>
                <Text style={styles.col7}>{formatCurrency(totalItem)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrapper}>
          <View style={{ width: 220 }}>
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal:</Text><Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text></View>
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Tax:</Text><Text style={styles.totalValue}>{formatCurrency(tax)}</Text></View>
            <View style={styles.totalRow}><Text style={[styles.totalLabel, { fontSize: 12 }]}>Grand Total:</Text><Text style={[styles.totalValue, { fontSize: 12 }]}>{formatCurrency(total)}</Text></View>
          </View>
        </View>

        {/* Remittance */}
        <View style={styles.remittance}>
          <Text style={{ fontWeight: "bold" }}>Remittance Instructions:</Text>
          <Text>Beneficiary: {invoice.remittance?.beneficiaryName || "-"}</Text>
          <Text>Account Number: {invoice.remittance?.accountNumber || "-"}</Text>
          <Text>SWIFT: {invoice.remittance?.swiftCode || "-"}</Text>
          <Text>IFSC: {invoice.remittance?.ifscCode || "-"}</Text>
          <Text>Bank: {invoice.remittance?.bankAddress || "-"}</Text>
          <Text>Remark: {invoice.remittance?.remark || invoice.remark || "-"}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This invoice is electronically generated by {invoice.supplier?.name || "-"}.
        </Text>

      </Page>
    </Document>
  );
}