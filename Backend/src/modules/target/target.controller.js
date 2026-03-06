const asyncHandler = require("../../utils/asyncHandler");
const targetService = require("./target.service");
const ApiError = require("../../utils/ApiError");

/**
 * Create Target
 */
const createTarget = asyncHandler(async (req, res) => {
  const target = await targetService.createTarget(req.body);

  res.status(201).json({
    success: true,
    data: target
  });
});

/**
 * Get All Targets (Pagination)
 */
const getAllTargets = asyncHandler(async (req, res) => {

  const { page = 1, limit = 10 } = req.query;

  const targets = await targetService.getAllTargets({
    page: Number(page),
    limit: Number(limit)
  });

  res.status(200).json({
    success: true,
    data: targets
  });
});

/**
 * Get Target By ID
 */
const getTargetById = asyncHandler(async (req, res) => {

  const target = await targetService.getTargetById(req.params.id);

  if (!target) {
    throw new ApiError(404, "Target not found");
  }

  res.status(200).json({
    success: true,
    data: target
  });
});

/**
 * Update Target
 */
const updateTarget = asyncHandler(async (req, res) => {

  const updated = await targetService.updateTarget(
    req.params.id,
    req.body
  );

  if (!updated) {
    throw new ApiError(404, "Target not found");
  }

  res.status(200).json({
    success: true,
    data: updated
  });
});

/**
 * Delete Target
 */
const deleteTarget = asyncHandler(async (req, res) => {

  const deleted = await targetService.deleteTarget(req.params.id);

  if (!deleted) {
    throw new ApiError(404, "Target not found");
  }

  res.status(200).json({
    success: true,
    message: "Target deleted successfully"
  });
});

module.exports = {
  createTarget,
  getAllTargets,
  getTargetById,
  updateTarget,
  deleteTarget
};