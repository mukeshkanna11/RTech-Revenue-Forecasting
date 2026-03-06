const express = require("express");
const controller = require("./client.controller");

const router = express.Router();

router.post("/", controller.createClient);
router.get("/", controller.getClients);
router.get("/:id", controller.getClientById);
router.put("/:id", controller.updateClient);
router.delete("/:id", controller.deleteClient);

module.exports = router;