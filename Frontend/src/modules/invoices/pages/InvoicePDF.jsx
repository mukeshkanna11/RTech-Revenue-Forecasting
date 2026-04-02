import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from "@react-pdf/renderer";

// Default company logo
import logo from "../../../assets/Rtech-logo.png";

// ---------- Helper ----------

const formatCurrency = (value) =>
  `₹ ${typeof value === "number" ? value.toFixed(2) : "0.00"}`;

// ---------- Styles ----------

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    position: "relative",
    backgroundColor: "#fff"
  },

  // Watermark
  watermark: {
    position: "absolute",
    top: "45%",
    left: "25%",
    fontSize: 72,
    opacity: 0.1,
    color: "#9ca3af",
    transform: "rotate(-30deg)"
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18
  },

  companyBlock: {
    maxWidth: 250
  },

  logo: {
    width: 85,
    marginBottom: 6
  },

  companyName: {
    fontSize: 15,
    fontWeight: "bold"
  },

  companyInfo: {
    fontSize: 9,
    color: "#555",
    lineHeight: 1.4
  },

  invoiceBlock: {
    alignItems: "flex-end"
  },

  invoiceTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4
  },

  status: {
    marginTop: 6,
    padding: 3,
    fontSize: 9,
    width: 70,
    textAlign: "center",
    borderRadius: 4
  },

  paid: { backgroundColor: "#16a34a", color: "#fff" },
  pending: { backgroundColor: "#f59e0b", color: "#fff" },
  draft: { backgroundColor: "#6b7280", color: "#fff" },

  // Client Section
  section: {
    marginTop: 6
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 3
  },

  // Table
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #d1d5db",
    paddingBottom: 5,
    marginTop: 15,
    fontWeight: "bold"
  },

  row: {
    flexDirection: "row",
    borderBottom: "1px solid #eee",
    paddingVertical: 5
  },

  col1: { width: "40%" },
  col2: { width: "12%" },
  col3: { width: "16%" },
  col4: { width: "12%" },
  col5: { width: "20%" },

  // Totals
  totalsWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15
  },

  totalsBox: {
    width: 200,
    borderTop: "1px solid #d1d5db",
    paddingTop: 6
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },

  grandTotal: {
    fontSize: 12,
    fontWeight: "bold",
    borderTop: "1px solid #ccc",
    paddingTop: 5
  },

  footer: {
    marginTop: 25,
    fontSize: 9,
    textAlign: "center",
    color: "#6b7280"
  }
});

// ---------- Component ----------

export default function InvoicePDF({ invoice }) {
  const status = invoice.status || "draft";

  // Safely compute totals
  const subtotal = invoice.items?.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
    0
  );

  const tax = invoice.items?.reduce(
    (sum, i) => sum + ((i.price || 0) * (i.quantity || 0) * ((i.taxPercent || 0) / 100)),
    0
  );

  const total = subtotal + tax - (invoice.discount || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Watermark */}
        <Text style={styles.watermark}>{status.toUpperCase()}</Text>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <Image style={styles.logo} src={invoice.companyLogo || logo} />
            <Text style={styles.companyName}>{invoice.companyName || "ReadyTech Solutions"}</Text>
            <Text style={styles.companyInfo}>{invoice.companyAddress || "2nd Floor, 149, Sri Nagar, Peelamedu, Coimbatore, Tamil Nadu 641004"}</Text>
            <Text style={styles.companyInfo}>Phone: {invoice.companyPhone || "07010797721"}</Text>
            <Text style={styles.companyInfo}>Email: {invoice.companyEmail || "info@readytechsolutions.in"}</Text>
          </View>

          <View style={styles.invoiceBlock}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text>Invoice #: {invoice.invoiceNumber}</Text>
            <Text>Date: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "-"}</Text>
            <Text style={[styles.status,
              status === "paid" ? styles.paid :
              status === "pending" ? styles.pending :
              styles.draft
            ]}>
              {status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text>{invoice.client?.companyName || "-"}</Text>
          <Text>{invoice.client?.email || "-"}</Text>
          <Text>{invoice.client?.phone || "-"}</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Description</Text>
          <Text style={styles.col2}>Qty</Text>
          <Text style={styles.col3}>Price</Text>
          <Text style={styles.col4}>Tax</Text>
          <Text style={styles.col5}>Total</Text>
        </View>

        {/* Table Rows */}
        {invoice.items?.map((item, idx) => {
          const totalItem = (item.price || 0) * (item.quantity || 0) * (1 + ((item.taxPercent || 0) / 100));
          return (
            <View key={idx} style={styles.row}>
              <Text style={styles.col1}>{item.description || "-"}</Text>
              <Text style={styles.col2}>{item.quantity || 0}</Text>
              <Text style={styles.col3}>{formatCurrency(item.price)}</Text>
              <Text style={styles.col4}>{item.taxPercent || 0}%</Text>
              <Text style={styles.col5}>{formatCurrency(totalItem)}</Text>
            </View>
          );
        })}

        {/* Totals */}
        <View style={styles.totalsWrapper}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}><Text>Subtotal</Text><Text>{formatCurrency(subtotal)}</Text></View>
            <View style={styles.totalRow}><Text>Tax</Text><Text>{formatCurrency(tax)}</Text></View>
            <View style={styles.totalRow}><Text>Discount</Text><Text>{formatCurrency(invoice.discount)}</Text></View>
            <View style={[styles.totalRow, styles.grandTotal]}><Text>Total</Text><Text>{formatCurrency(total)}</Text></View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for choosing {invoice.companyName || "ReadyTech Solutions"}.  
          For assistance, contact {invoice.companyEmail || "info@readytechsolutions.in"}
        </Text>
      </Page>
    </Document>
  );
}