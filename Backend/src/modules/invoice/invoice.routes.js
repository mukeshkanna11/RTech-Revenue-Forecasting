const express = require("express");
const controller = require("./invoice.controller");

const router = express.Router();

/**
 * ===============================
 * INVOICE ROUTES
 * ===============================
 */

router.post("/", controller.createInvoice);

router.get("/", controller.getInvoices);

router.get("/:id", controller.getInvoiceById);

router.patch("/:id", controller.updateInvoice);

router.patch("/:id/status", controller.updateInvoiceStatus);

router.delete("/:id", controller.deleteInvoice);

router.get("/:id/pdf", controller.downloadInvoicePDF);

module.exports = router;