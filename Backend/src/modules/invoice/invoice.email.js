const nodemailer = require("nodemailer");

/* =========================================
   MAIL TRANSPORT
========================================= */

const transporter =
  nodemailer.createTransport({
    host:
      process.env.SMTP_HOST ||
      "smtp.gmail.com",

    port:
      Number(
        process.env.SMTP_PORT
      ) || 587,

    secure: false,

    auth: {
      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS
    }
  });

/* =========================================
   SEND INVOICE EMAIL
========================================= */

const sendInvoiceEmail =
  async (
    invoice,
    pdfBuffer
  ) => {
    try {
      const customer =
        invoice.customer || {};

      if (!customer.email) {
        throw new Error(
          "Customer email not found"
        );
      }

      await transporter.sendMail({
        from:
          process.env.MAIL_FROM ||
          `"ReadyTech Billing" <${process.env.EMAIL_USER}>`,

        to: customer.email,

        subject: `Invoice ${invoice.invoiceNumber}`,

        html: `
          <div style="font-family:Arial,sans-serif">

            <h2>
              Invoice ${
                invoice.invoiceNumber
              }
            </h2>

            <p>
              Dear ${
                customer.name ||
                "Customer"
              },
            </p>

            <p>
              Please find your invoice attached.
            </p>

            <table cellpadding="6">

              <tr>
                <td><b>Invoice No</b></td>
                <td>${
                  invoice.invoiceNumber
                }</td>
              </tr>

              <tr>
                <td><b>Invoice Date</b></td>
                <td>
                  ${new Date(
                    invoice.invoiceDate
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </td>
              </tr>

              <tr>
                <td><b>Due Date</b></td>
                <td>
                  ${
                    invoice.dueDate
                      ? new Date(
                          invoice.dueDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"
                  }
                </td>
              </tr>

              <tr>
                <td><b>Total</b></td>
                <td>
                  ₹ ${Number(
                    invoice.grandTotal ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </td>
              </tr>

            </table>

            <p>
              Thank you for your business.
            </p>

            <br/>

            <p>
              Regards,<br/>
              ${
                invoice.companyDisplayName ||
                "Billing Team"
              }
            </p>

          </div>
        `,

        attachments: [
          {
            filename:
              `${
                invoice.invoiceNumber
              }.pdf`,

            content:
              pdfBuffer
          }
        ]
      });

      console.log(
        `[MAIL] Invoice sent -> ${customer.email}`
      );

      return true;
    } catch (error) {
      console.error(
        "[MAIL ERROR]",
        error
      );

      throw error;
    }
  };

module.exports =
  sendInvoiceEmail;