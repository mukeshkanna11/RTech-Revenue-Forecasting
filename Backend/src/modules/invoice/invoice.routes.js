const express = require("express");

const controller = require("./invoice.controller");

const router = express.Router();

/* CRUD */

router.post("/", controller.createInvoice);

router.get("/", controller.getInvoices);

router.get("/stats", controller.getInvoiceStats);

router.get("/revenue", controller.getRevenueAnalytics);

router.get("/:id", controller.getInvoiceById);

router.patch("/:id", controller.updateInvoice);

router.patch("/:id/status", controller.updateInvoiceStatus);

router.delete("/:id", controller.deleteInvoice);

/* PDF + EMAIL */

router.get("/:id/pdf", controller.downloadInvoicePDF);

router.post("/:id/email", controller.emailInvoice);

module.exports = router;