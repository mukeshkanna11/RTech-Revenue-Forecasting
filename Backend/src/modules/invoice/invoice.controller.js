const mongoose = require("mongoose");
const React = require("react");
const ReactPDF = require("@react-pdf/renderer");

const service = require("./invoice.service");
const Invoice = require("./invoice.model");
const InvoicePDF = require("./invoice.pdf");

/* ==================================================
   RESPONSE HELPER
================================================== */

const sendResponse = (
  res,
  {
    success = true,
    status = 200,
    message = "",
    data = null
  }
) => {
  return res.status(status).json({
    success,
    message,
    data
  });
};

/* ==================================================
   OBJECT ID VALIDATION
================================================== */

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid invoice ID");
  }
};

/* ==================================================
   CREATE INVOICE
================================================== */

exports.createInvoice = async (req, res) => {
  try {
    const result = await service.createInvoice(req.body);

    return sendResponse(res, {
      message: "Invoice created successfully",
      data: result.data
    });
  } catch (error) {
    return sendResponse(res, {
      success: false,
      status: 400,
      message: error.message
    });
  }
};

/* ==================================================
   GET ALL INVOICES
================================================== */

exports.getInvoices = async (req, res) => {
  try {
    const result = await service.getAllInvoices(req.query);

    return sendResponse(res, {
      message: "Invoices fetched successfully",
      data: result
    });
  } catch (error) {
    return sendResponse(res, {
      success: false,
      status: 400,
      message: error.message
    });
  }
};

/* ==================================================
   GET SINGLE INVOICE
================================================== */

exports.getInvoice = async (req, res) => {
  try {
    validateObjectId(req.params.id);

    const result = await service.getInvoiceById(req.params.id);

    return sendResponse(res, {
      message: "Invoice fetched successfully",
      data: result.data
    });
  } catch (error) {
    return sendResponse(res, {
      success: false,
      status: 404,
      message: error.message
    });
  }
};

/* ==================================================
   UPDATE INVOICE
================================================== */

exports.updateInvoice = async (req, res) => {
  try {
    validateObjectId(req.params.id);

    const result = await service.updateInvoice(
      req.params.id,
      req.body
    );

    return sendResponse(res, {
      message: "Invoice updated successfully",
      data: result.data
    });
  } catch (error) {
    return sendResponse(res, {
      success: false,
      status: 400,
      message: error.message
    });
  }
};

/* ==================================================
   DELETE INVOICE
================================================== */

exports.deleteInvoice = async (req, res) => {
  try {
    validateObjectId(req.params.id);

    const result = await service.deleteInvoice(req.params.id);

    return sendResponse(res, {
      message: result.message
    });
  } catch (error) {
    return sendResponse(res, {
      success: false,
      status: 404,
      message: error.message
    });
  }
};

/* ==================================================
   PREPARE INVOICE DATA FOR PDF
================================================== */

const prepareInvoiceForPDF = (invoice) => {
  const data =
    typeof invoice?.toObject === "function"
      ? invoice.toObject()
      : { ...invoice };

  data.customer =
    data.customer &&
    Object.keys(data.customer).length > 0
      ? data.customer
      : {
          name: "",
          billingAddress: "",
          shippingAddress: "",
          email: "",
          phone: ""
        };

  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  (data.items || []).forEach((item) => {
    subtotal += Number(
      item.taxableValue ??
      item.value ??
      0
    );

    cgstTotal += Number(item.cgstAmount || 0);
    sgstTotal += Number(item.sgstAmount || 0);
    igstTotal += Number(item.igstAmount || 0);
  });

  data.subtotal ??= subtotal;
  data.cgstTotal ??= cgstTotal;
  data.sgstTotal ??= sgstTotal;
  data.igstTotal ??= igstTotal;

  data.totalTax =
    cgstTotal +
    sgstTotal +
    igstTotal;

  data.grandTotal ??=
    subtotal +
    data.totalTax +
    Number(data.otherCharges || 0) -
    Number(data.tdsAmount || 0);

  data.totalAmount ??= data.grandTotal;

  return data;
};

/* ==================================================
   COMMON PDF STREAM FUNCTION
================================================== */

const streamInvoicePDF = async (
  res,
  invoice,
  download = false
) => {
  const pdfData = prepareInvoiceForPDF(invoice);

  const element = React.createElement(
    InvoicePDF,
    {
      invoice: pdfData
    }
  );

  const stream =
    await ReactPDF.renderToStream(element);

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `${
      download ? "attachment" : "inline"
    }; filename=${
      pdfData.invoiceNumber || "invoice"
    }.pdf`
  );

  stream.pipe(res);

  stream.on("end", () => {
    res.end();
  });

  stream.on("error", (err) => {
    console.error("PDF STREAM ERROR:", err);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "PDF generation failed"
      });
    }
  });
};

/* ==================================================
   VIEW PDF
================================================== */

exports.generateInvoicePDF = async (
  req,
  res
) => {
  try {
    validateObjectId(req.params.id);

    const invoice =
      await service.getInvoiceForPDF(
        req.params.id
      );

    if (!invoice) {
      return sendResponse(res, {
        success: false,
        status: 404,
        message: "Invoice not found"
      });
    }

    await streamInvoicePDF(
      res,
      invoice,
      false
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, {
      success: false,
      status: 500,
      message: error.message
    });
  }
};

/* ==================================================
   DOWNLOAD PDF
================================================== */

exports.downloadInvoicePDF = async (
  req,
  res
) => {
  try {
    validateObjectId(req.params.id);

    const invoice =
      await Invoice.findById(
        req.params.id
      ).lean();

    if (!invoice) {
      return sendResponse(res, {
        success: false,
        status: 404,
        message: "Invoice not found"
      });
    }

    await streamInvoicePDF(
      res,
      invoice,
      true
    );
  } catch (error) {
    console.error(error);

    return sendResponse(res, {
      success: false,
      status: 500,
      message: error.message
    });
  }
};

exports.getInvoiceByNumber = async (
  req,
  res
) => {
  try {
    const result =
      await service.getInvoiceByNumber(
        req.params.invoiceNumber
      );

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.updatePaymentStatus =
  async (req, res) => {
    try {
      const invoice =
        await Invoice.findByIdAndUpdate(
          req.params.id,
          {
            paymentStatus:
              req.body.paymentStatus
          },
          {
            new: true
          }
        );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message:
            "Invoice not found"
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  exports.getInvoiceStats =
  async (req, res) => {
    try {
      const stats =
        await Invoice.aggregate([
          {
            $group: {
              _id: null,

              totalInvoices: {
                $sum: 1
              },

              totalRevenue: {
                $sum: "$grandTotal"
              },

              paidInvoices: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$paymentStatus",
                        "Paid"
                      ]
                    },
                    1,
                    0
                  ]
                }
              },

              pendingInvoices: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$paymentStatus",
                        "Pending"
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]);

      res.json({
        success: true,
        data:
          stats[0] || {
            totalInvoices: 0,
            totalRevenue: 0,
            paidInvoices: 0,
            pendingInvoices: 0
          }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };