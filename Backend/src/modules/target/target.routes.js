const express = require("express");

const controller = require("./target.controller");

const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createTargetSchema, updateTargetSchema } = require("./target.validation");

const router = express.Router();

/**
 * =====================================
 * ADMIN ROUTES
 * =====================================
 */

router.post(
  "/",
  protect,
  authorize("admin"),
  validate(createTargetSchema),
  controller.createTarget
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  validate(updateTargetSchema),
  controller.updateTarget
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  controller.deleteTarget
);

/**
 * =====================================
 * USER ROUTES
 * =====================================
 */

router.get(
  "/",
  protect,
  controller.getAllTargets
);

router.get(
  "/:id",
  protect,
  controller.getTargetById
);

router.get(
  "/analytics/department",
  protect,
  controller.departmentTargets
);

router.get(
  "/analytics/target-vs-revenue",
  protect,
  controller.targetVsRevenue
);

module.exports = router;