const React = require("react");
const {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} = require("@react-pdf/renderer");

/* =========================================
   HELPERS
========================================= */

const safe = (v) =>
  isNaN(Number(v)) ? 0 : Number(v);

const money = (v) =>
  `Rs. ${safe(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const formatDate = (date) => {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  } catch {
    return "-";
  }
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#ffffff"
  },

  /* ================= HEADER ================= */

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: 1
  },

  companyName: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4
  },

  heading: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111827"
  },

  section: {
    marginBottom: 12
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  /* ================= CARDS ================= */

  box: {
    width: "48%",

    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",

    borderRadius: 4,

    padding: 10,

    backgroundColor: "#fafafa"
  },

  footerBox: {
    marginTop: 12,

    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",

    borderRadius: 4,

    padding: 10
  },

  /* ================= TABLE ================= */

  tableHeader: {
    flexDirection: "row",

    backgroundColor: "#f3f4f6",

    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "#d1d5db",

    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#d1d5db",

    paddingVertical: 6,
    paddingHorizontal: 4,

    marginTop: 12,

    fontWeight: "bold"
  },

  tableRow: {
    flexDirection: "row",

    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#e5e7eb",

    paddingVertical: 5,
    paddingHorizontal: 4
  },

  /* ================= COLUMNS ================= */

  col1: {
    width: "5%"
  },

  col2: {
    width: "27%"
  },

  col3: {
    width: "10%"
  },

  col4: {
    width: "8%",
    textAlign: "center"
  },

  col5: {
    width: "12%",
    textAlign: "right"
  },

  col6: {
    width: "12%",
    textAlign: "right"
  },

  col7: {
    width: "10%",
    textAlign: "center"
  },

  col8: {
    width: "16%",
    textAlign: "right"
  },

  /* ================= TOTAL SECTION ================= */

  totalBox: {
    marginTop: 14,
    marginLeft: "55%",

    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",

    borderRadius: 4,

    padding: 10,

    backgroundColor: "#fafafa"
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginTop: 6,
    paddingTop: 6,

    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "#d1d5db"
  },

  bold: {
    fontWeight: "bold"
  },

  /* ================= AMOUNT WORDS ================= */

  amountWords: {
    marginTop: 6,
    lineHeight: 1.4
  },

  /* ================= TERMS ================= */

  termsText: {
    fontSize: 8,
    lineHeight: 1.5
  },

  /* ================= SIGNATURE ================= */

  signature: {
    marginTop: 45,
    alignItems: "flex-end"
  },

  signatureLine: {
    marginTop: 25,

    width: 140,

    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "#111827"
  },

  signText: {
    marginTop: 4,
    fontSize: 9
  },

  /* ================= FOOTER ================= */

  footer: {
    position: "absolute",
    bottom: 15,
    left: 30,
    right: 30,

    textAlign: "center",

    fontSize: 8,
    color: "#6b7280"
  }
});

/* =========================================
   COMPONENT
========================================= */

const InvoicePDF = ({ invoice }) => {
  if (!invoice) {
    return (
      React.createElement(
        Document,
        null,
        React.createElement(
          Page,
          null,
          React.createElement(
            Text,
            null,
            "Invoice data unavailable"
          )
        )
      )
    );
  }

  const supplier =
    invoice.supplier || {};

  const customer =
    invoice.customer || {};

  const remittance =
    invoice.remittance || {};

  const items =
    invoice.items || [];

  return React.createElement(
    Document,
    null,

    React.createElement(
      Page,
      {
        size: "A4",
        style: styles.page
      },

      /* TITLE */

      React.createElement(
        Text,
        { style: styles.title },
        "TAX INVOICE"
      ),

      /* COMPANY + INVOICE */

      React.createElement(
        View,
        {
          style: [
            styles.row,
            styles.section
          ]
        },

        React.createElement(
          View,
          { style: styles.box },

          React.createElement(
            Text,
            {
              style:
                styles.companyName
            },
            supplier.name || "-"
          ),

          React.createElement(
            Text,
            null,
            supplier.address || "-"
          ),

          React.createElement(
            Text,
            null,
            `GSTIN: ${
              supplier.gstin || "-"
            }`
          ),

          React.createElement(
            Text,
            null,
            `PAN: ${
              supplier.pan || "-"
            }`
          ),

          React.createElement(
            Text,
            null,
            supplier.phone || "-"
          )
        ),

        React.createElement(
          View,
          { style: styles.box },

          React.createElement(
            Text,
            {
              style:
                styles.heading
            },
            "Invoice Details"
          ),

          React.createElement(
            Text,
            null,
            `Invoice No: ${
              invoice.invoiceNumber ||
              "-"
            }`
          ),

          React.createElement(
            Text,
            null,
            `Invoice Date: ${formatDate(
              invoice.invoiceDate
            )}`
          ),

          React.createElement(
            Text,
            null,
            `PO No: ${
              invoice.purchaseOrderNumber ||
              "-"
            }`
          ),

          React.createElement(
            Text,
            null,
            `Due Date: ${formatDate(
              invoice.dueDate
            )}`
          ),

          React.createElement(
            Text,
            null,
            `Status: ${
              invoice.paymentStatus ||
              "Pending"
            }`
          )
        )
      ),

      /* BILL TO */

      React.createElement(
        View,
        {
          style: styles.footerBox
        },

        React.createElement(
          Text,
          {
            style:
              styles.heading
          },
          "Bill To"
        ),

        React.createElement(
          Text,
          null,
          customer.name || "-"
        ),

        React.createElement(
          Text,
          null,
          customer.billingAddress ||
            customer.address ||
            "-"
        ),

        React.createElement(
          Text,
          null,
          customer.email || "-"
        ),

        React.createElement(
          Text,
          null,
          customer.phone || "-"
        )
      ),

      /* TABLE */

      React.createElement(
        View,
        {
          style:
            styles.tableHeader
        },

        ["#", "Description", "HSN", "Qty", "Rate", "Taxable", "GST", "Amount"].map(
          (h, i) =>
            React.createElement(
              Text,
              {
                key: i,
                style:
                  styles[
                    `col${i + 1}`
                  ]
              },
              h
            )
        )
      ),

      ...items.map(
        (item, index) =>
          React.createElement(
            View,
            {
              key: index,
              style:
                styles.tableRow
            },

            React.createElement(
              Text,
              {
                style:
                  styles.col1
              },
              index + 1
            ),

            React.createElement(
              Text,
              {
                style:
                  styles.col2
              },
              item.description
            ),

            React.createElement(
              Text,
              {
                style:
                  styles.col3
              },
              item.hsn
            ),

            React.createElement(
              Text,
              {
                style:
                  styles.col4
              },
              item.quantity || 1
            ),

            React.createElement(
              Text,
              {
                style:
                  styles.col5
              },
              money(
                item.unitPrice
              )
            ),

            React.createElement(
              Text,
              {
                style:
                  styles.col6
              },
              money(
                item.taxableValue
              )
            ),

            React.createElement(
              Text,
              {
                style:
                  styles.col7
              },
              invoice.taxType ===
              "CGST_SGST"
                ? `${safe(
                    item.cgstRate
                  ) +
                    safe(
                      item.sgstRate
                    )}%`
                : `${safe(
                    item.igstRate
                  )}%`
            ),

            React.createElement(
              Text,
              {
                style:
                  styles.col8
              },
              money(item.total)
            )
          )
      ),

      /* TOTALS */

      React.createElement(
        View,
        {
          style:
            styles.totalBox
        },

        React.createElement(
          View,
          {
            style:
              styles.totalRow
          },
          React.createElement(
            Text,
            null,
            "Subtotal"
          ),
          React.createElement(
            Text,
            null,
            money(
              invoice.subtotal
            )
          )
        ),

        React.createElement(
          View,
          {
            style:
              styles.totalRow
          },
          React.createElement(
            Text,
            null,
            "CGST"
          ),
          React.createElement(
            Text,
            null,
            money(
              invoice.cgstTotal
            )
          )
        ),

        React.createElement(
          View,
          {
            style:
              styles.totalRow
          },
          React.createElement(
            Text,
            null,
            "SGST"
          ),
          React.createElement(
            Text,
            null,
            money(
              invoice.sgstTotal
            )
          )
        ),

        React.createElement(
          View,
          {
            style:
              styles.totalRow
          },
          React.createElement(
            Text,
            null,
            "IGST"
          ),
          React.createElement(
            Text,
            null,
            money(
              invoice.igstTotal
            )
          )
        ),

        React.createElement(
          View,
          {
            style:
              styles.totalRow
          },
          React.createElement(
            Text,
            {
              style:
                styles.bold
            },
            "Grand Total"
          ),
          React.createElement(
            Text,
            {
              style:
                styles.bold
            },
            money(
              invoice.grandTotal
            )
          )
        )
      ),

      /* AMOUNT IN WORDS */

      React.createElement(
        View,
        {
          style:
            styles.footerBox
        },

        React.createElement(
          Text,
          {
            style:
              styles.heading
          },
          "Amount In Words"
        ),

        React.createElement(
          Text,
          null,
          invoice.amountInWords ||
            "-"
        )
      ),

      /* BANK */

      React.createElement(
        View,
        {
          style:
            styles.footerBox
        },

        React.createElement(
          Text,
          {
            style:
              styles.heading
          },
          "Bank Details"
        ),

        React.createElement(
          Text,
          null,
          `Beneficiary : ${
            remittance.beneficiaryName ||
            "-"
          }`
        ),

        React.createElement(
          Text,
          null,
          `Bank : ${
            remittance.bankName ||
            "-"
          }`
        ),

        React.createElement(
          Text,
          null,
          `Account : ${
            remittance.accountNumber ||
            "-"
          }`
        ),

        React.createElement(
          Text,
          null,
          `IFSC : ${
            remittance.ifscCode ||
            "-"
          }`
        )
      ),

      /* TERMS */

      React.createElement(
        View,
        {
          style:
            styles.footerBox
        },

        React.createElement(
          Text,
          {
            style:
              styles.heading
          },
          "Terms & Conditions"
        ),

        React.createElement(
          Text,
          null,
          invoice.termsAndConditions ||
            "Payment due as per agreed terms."
        )
      ),

      /* SIGNATURE */

      React.createElement(
        View,
        {
          style:
            styles.signature
        },

        React.createElement(
          Text,
          null,
          invoice.companyDisplayName ||
            supplier.name ||
            ""
        ),

        React.createElement(
          Text,
          {
            style: {
              marginTop: 30
            }
          },
          "Authorized Signatory"
        )
      )
    )
  );
};

module.exports = InvoicePDF;