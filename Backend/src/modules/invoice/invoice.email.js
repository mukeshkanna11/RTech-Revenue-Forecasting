const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendInvoiceEmail = async (invoice, pdf) => {

  await transporter.sendMail({

    from: `"Billing System" <${process.env.EMAIL_USER}>`,

    to: invoice.client.email,

    subject: `Invoice ${invoice.invoiceNumber}`,

    text: `Dear ${invoice.client.name}, please find attached invoice.`,

    attachments: [
      {
        filename: `${invoice.invoiceNumber}.pdf`,
        content: pdf
      }
    ]

  });

};

module.exports = sendInvoiceEmail;