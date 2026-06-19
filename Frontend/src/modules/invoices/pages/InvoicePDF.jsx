import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const safe = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const formatCurrency = (v) =>
  `Rs. ${safe(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const styles = StyleSheet.create({

  sectionTitle: {
  fontSize: 11,
  fontWeight: "bold",
  color: "#1e40af",
  marginBottom: 6
},

infoGrid: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 15,
  border: "1px solid #d1d5db",
  padding: 10
},

infoItem: {
  width: "24%"
},

signature: {
  marginTop: 30,
  alignItems: "flex-end"
},

amountWords: {
  marginTop: 12,
  padding: 10,
  backgroundColor: "#f8fafc",
  border: "1px solid #d1d5db"
}
,
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

 let calcSubtotal = 0;

items.forEach((i) => {
  calcSubtotal += safe(
    i.taxableValue
  );
});

  const subtotal = safe(invoice.subtotal ?? calcSubtotal);
  const tax =
  safe(invoice.cgstTotal) +
  safe(invoice.sgstTotal) +
  safe(invoice.igstTotal);
  const grandTotal = safe(invoice.grandTotal ?? invoice.totalAmount ?? subtotal + tax);

 return (
  <Document>
    <Page size="A4" style={styles.page}>

      {/* COMPANY HEADER */}
      <View
        style={{
          backgroundColor: "#1e40af",
          padding: 16,
          borderRadius: 8,
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {invoice.companyDisplayName || supplier.name}
        </Text>

        <Text
          style={{
            color: "#dbeafe",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          TAX INVOICE
        </Text>
      </View>

      {/* INVOICE INFO */}
      <View style={styles.row}>

        <View style={styles.card}>
          <Text style={styles.bold}>Invoice Details</Text>

          <Text>
            Invoice No :
            {" "}
            {invoice.invoiceNumber}
          </Text>

          <Text>
            Invoice Date :
            {" "}
            {invoice.invoiceDate
              ? new Date(
                  invoice.invoiceDate
                ).toLocaleDateString("en-IN")
              : "-"}
          </Text>

          <Text>
            Due Date :
            {" "}
            {invoice.dueDate
              ? new Date(
                  invoice.dueDate
                ).toLocaleDateString("en-IN")
              : "-"}
          </Text>

          <Text>
            PO Number :
            {" "}
            {invoice.purchaseOrderNumber || "-"}
          </Text>

          <Text>
            PO Date :
            {" "}
            {invoice.purchaseOrderDate
              ? new Date(
                  invoice.purchaseOrderDate
                ).toLocaleDateString("en-IN")
              : "-"}
          </Text>

          <Text>
            Tax Type :
            {" "}
            {invoice.taxType || "-"}
          </Text>

          <Text>
            Payment Status :
            {" "}
            {invoice.paymentStatus || "-"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.bold}>Supplier Details</Text>

          <Text>{supplier.name}</Text>

          <Text>{supplier.address}</Text>

          <Text>
            GSTIN :
            {" "}
            {supplier.gstin}
          </Text>

          <Text>
            PAN :
            {" "}
            {supplier.pan}
          </Text>

          <Text>
            Phone :
            {" "}
            {supplier.phone}
          </Text>

          <Text>
            Email :
            {" "}
            {supplier.email}
          </Text>
        </View>

      </View>

      {/* CUSTOMER */}
      <View style={styles.fullCard}>
        <Text style={styles.bold}>
          Customer Details
        </Text>

        <Text>
          {customer.name}
        </Text>

        <Text>
          GSTIN :
          {" "}
          {customer.gstin || "-"}
        </Text>

        <Text>
          Email :
          {" "}
          {customer.email}
        </Text>

        <Text>
          Phone :
          {" "}
          {customer.phone}
        </Text>

        <Text>
          Billing :
          {" "}
          {customer.billingAddress}
        </Text>

        <Text>
          Shipping :
          {" "}
          {customer.shippingAddress}
        </Text>
      </View>

      {/* ITEMS TABLE */}
      <View style={styles.table}>

        <View
          style={[
            styles.tableHeader,
            {
              backgroundColor: "#1e40af",
            },
          ]}
        >
          <Text style={{ width: "5%" }}>#</Text>
          <Text style={{ width: "22%" }}>
            Description
          </Text>
          <Text style={{ width: "10%" }}>
            HSN
          </Text>
          <Text style={{ width: "8%" }}>
            Qty
          </Text>
          <Text style={{ width: "12%" }}>
            Rate
          </Text>
          <Text style={{ width: "10%" }}>
            Disc
          </Text>
          <Text style={{ width: "13%" }}>
            Taxable
          </Text>
          <Text style={{ width: "8%" }}>
            GST
          </Text>
          <Text style={{ width: "12%" }}>
            Total
          </Text>
        </View>

        {items.map((item, index) => (
          <View
            key={index}
            style={styles.tableRow}
          >
            <Text style={{ width: "5%" }}>
              {index + 1}
            </Text>

            <Text style={{ width: "22%" }}>
              {item.description}
            </Text>

            <Text style={{ width: "10%" }}>
              {item.hsn}
            </Text>

            <Text style={{ width: "8%" }}>
              {item.quantity}
            </Text>

            <Text style={{ width: "12%" }}>
              {formatCurrency(
                item.unitPrice
              )}
            </Text>

            <Text style={{ width: "10%" }}>
              {formatCurrency(
                item.discount
              )}
            </Text>

            <Text style={{ width: "13%" }}>
              {formatCurrency(
                item.taxableValue
              )}
            </Text>

            <Text style={{ width: "8%" }}>
              {item.igstRate}%
            </Text>

            <Text style={{ width: "12%" }}>
              {formatCurrency(
                item.total
              )}
            </Text>
          </View>
        ))}

      </View>

      {/* TOTALS */}
      <View
        style={{
          marginTop: 20,
          marginLeft: "50%",
          border: "1px solid #d1d5db",
          padding: 10,
        }}
      >

        <View style={styles.totalRow}>
          <Text>Subtotal</Text>
          <Text>
            {formatCurrency(
              invoice.subtotal
            )}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text>CGST</Text>
          <Text>
            {formatCurrency(
              invoice.cgstTotal
            )}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text>SGST</Text>
          <Text>
            {formatCurrency(
              invoice.sgstTotal
            )}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text>IGST</Text>
          <Text>
            {formatCurrency(
              invoice.igstTotal
            )}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text>Other Charges</Text>
          <Text>
            {formatCurrency(
              invoice.otherCharges
            )}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text>TDS</Text>
          <Text>
            {formatCurrency(
              invoice.tdsAmount
            )}
          </Text>
        </View>

        <View
          style={[
            styles.totalRow,
            {
              borderTop:
                "1px solid #000",
              paddingTop: 5,
            },
          ]}
        >
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            Grand Total
          </Text>

          <Text
            style={{
              fontWeight: "bold",
              color: "#1e40af",
            }}
          >
            {formatCurrency(
              invoice.grandTotal
            )}
          </Text>
        </View>

      </View>

      {/* AMOUNT IN WORDS */}
      <View style={styles.fullCard}>
        <Text style={styles.bold}>
          Amount In Words
        </Text>

        <Text>
          {invoice.amountInWords ||
            "-"}
        </Text>
      </View>

      {/* BANK DETAILS */}
      <View style={styles.fullCard}>
        <Text
          style={{
            fontWeight: "bold",
            marginBottom: 6,
          }}
        >
          Bank / Remittance Details
        </Text>

        <Text>
          Beneficiary :
          {" "}
          {remittance.beneficiaryName}
        </Text>

        <Text>
          Bank :
          {" "}
          {remittance.bankName}
        </Text>

        <Text>
          Account :
          {" "}
          {remittance.accountNumber}
        </Text>

        <Text>
          IFSC :
          {" "}
          {remittance.ifscCode}
        </Text>

        <Text>
          SWIFT :
          {" "}
          {remittance.swiftCode}
        </Text>
      </View>

      {/* TERMS */}
      <View style={styles.fullCard}>
        <Text style={styles.bold}>
          Terms & Conditions
        </Text>

        <Text>
          {invoice.termsAndConditions}
        </Text>
      </View>

      {/* SIGNATURE */}
      <View
        style={{
          marginTop: 30,
          alignItems: "flex-end",
        }}
      >
        <Text>
          For
          {" "}
          {invoice.companyDisplayName}
        </Text>

        <Text
          style={{
            marginTop: 30,
            fontWeight: "bold",
          }}
        >
          {invoice.authorisedSignatory}
        </Text>

        <Text>
          Authorized Signatory
        </Text>
      </View>

    </Page>
  </Document>
);  

};