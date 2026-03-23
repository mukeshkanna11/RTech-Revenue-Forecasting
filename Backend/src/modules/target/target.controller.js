const asyncHandler = require("../../utils/asyncHandler");
const targetService = require("./target.service");

/**
 * CREATE TARGET
 */
const createTarget = asyncHandler(async (req, res) => {

  const target = await targetService.createTarget(req.body);

  res.status(201).json({
    success: true,
    message: "Target created successfully",
    data: target
  });
});

/**
 * GET ALL TARGETS
 */
const getAllTargets = asyncHandler(async (req, res) => {

  const result = await targetService.getAllTargets(req.query);

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * GET TARGET BY ID
 */
const getTargetById = asyncHandler(async (req, res) => {

  const target = await targetService.getTargetById(req.params.id);

  res.status(200).json({
    success: true,
    data: target
  });
});

/**
 * =====================================
 * UPDATE TARGET (CONTROLLER - SAAS)
 * =====================================
 */
const updateTarget = asyncHandler(async (req, res) => {

  const { id } = req.params;

  // ✅ 1. Basic request validation
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Target ID is required",
    });
  }

  // ✅ 2. Ensure payload exists
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No data provided for update",
    });
  }

  // ✅ 3. (Optional SaaS) Attach audit info
  const payload = {
    ...req.body,
    // updatedBy: req.user?.id,   // if auth exists
    updatedAt: new Date(),
  };

  console.log("📝 Update Target Request:", {
    id,
    payload,
  });

  // ✅ 4. Service call
  const updated = await targetService.updateTarget(id, payload);

  // ✅ 5. Standardized response
  return res.status(200).json({
    success: true,
    message: "Target updated successfully",
    data: updated,
  });
});

/**
 * DELETE TARGET
 */
const deleteTarget = asyncHandler(async (req, res) => {

  await targetService.deleteTarget(req.params.id);

  res.status(200).json({
    success: true,
    message: "Target deleted successfully"
  });
});

/**
 * TARGET VS REVENUE REPORT
 */
const targetVsRevenue = asyncHandler(async (req, res) => {

  const report = await targetService.getTargetVsRevenue();

  res.status(200).json({
    success: true,
    data: report
  });
});

/**
 * DEPARTMENT TARGET ANALYTICS
 */
const departmentTargets = asyncHandler(async (req, res) => {

  const analytics = await targetService.getDepartmentTargets();

  res.status(200).json({
    success: true,
    data: analytics
  });
});

module.exports = {
  createTarget,
  getAllTargets,
  getTargetById,
  updateTarget,
  deleteTarget,
  targetVsRevenue,
  departmentTargets
};