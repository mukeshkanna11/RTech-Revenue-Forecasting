const router = require("express").Router();

const controller = require("./invoice.controller");

/* ==================================================
   INVOICE CRUD
================================================== */

router.post(
  "/",
  controller.createInvoice
);

router.get(
  "/",
  controller.getInvoices
);

router.get(
  "/:id",
  controller.getInvoice
);

router.put(
  "/:id",
  controller.updateInvoice
);

router.delete(
  "/:id",
  controller.deleteInvoice
);

/* ==================================================
   PDF
================================================== */

// View PDF in browser
router.get(
  "/:id/pdf",
  controller.generateInvoicePDF
);

// Download PDF
router.get(
  "/:id/download",
  controller.downloadInvoicePDF
);

/* ==================================================
   INVOICE NUMBER SEARCH
================================================== */

router.get(
  "/number/:invoiceNumber",
  controller.getInvoiceByNumber
);

/* ==================================================
   PAYMENT STATUS
================================================== */

router.patch(
  "/:id/payment-status",
  controller.updatePaymentStatus
);

/* ==================================================
   DASHBOARD STATS
================================================== */

router.get(
  "/stats/summary",
  controller.getInvoiceStats
);

module.exports = router;