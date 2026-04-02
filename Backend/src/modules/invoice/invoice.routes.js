const router = require("express").Router();
const controller = require("./invoice.controller");

router.post("/", controller.createInvoice);
router.get("/", controller.getInvoices);
router.get("/:id", controller.getInvoice);
router.put("/:id", controller.updateInvoice);
router.delete("/:id", controller.deleteInvoice);

/* PDF ROUTE */
// routes/invoice.routes.js
router.get("/:id/pdf", controller.generateInvoicePDF);

module.exports = router;