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
 * UPDATE TARGET
 */
const updateTarget = asyncHandler(async (req, res) => {

  const updated = await targetService.updateTarget(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Target updated successfully",
    data: updated
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