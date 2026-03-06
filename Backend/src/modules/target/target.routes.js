const express = require("express");
const {
  createTarget,
  getAllTargets,
  getTargetById,
  updateTarget,
  deleteTarget
} = require("./target.controller");

const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

const router = express.Router();

/* Admin Only */
router.post("/", protect, authorize("admin"), createTarget);
router.put("/:id", protect, authorize("admin"), updateTarget);
router.delete("/:id", protect, authorize("admin"), deleteTarget);

/* All Logged Users */
router.get("/", protect, getAllTargets);
router.get("/:id", protect, getTargetById);

module.exports = router;