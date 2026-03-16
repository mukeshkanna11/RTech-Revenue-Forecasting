const mongoose = require("mongoose");
const Target = require("./target.model");
const Revenue = require("../revenue/revenue.model");
const ApiError = require("../../utils/ApiError");

/**
 * =====================================
 * BUILD FILTER
 * =====================================
 */
const buildFilter = (query = {}) => {
  const filter = { isDeleted: false };

  if (query.year) filter.year = Number(query.year);
  if (query.month) filter.month = Number(query.month);
  if (query.department) filter.department = query.department;

  return filter;
};

/**
 * =====================================
 * CREATE TARGET
 * =====================================
 */
const createTarget = async (payload) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const exists = await Target.findOne({
      month: payload.month,
      year: payload.year,
      department: payload.department,
      isDeleted: false
    }).session(session);

    if (exists) {
      throw new ApiError(
        409,
        "Target already exists for this month, year and department"
      );
    }

    const target = await Target.create([payload], { session });

    await session.commitTransaction();

    return target[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * =====================================
 * GET TARGETS WITH PAGINATION
 * =====================================
 */
const getAllTargets = async (query) => {

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 10, 100);

  const filter = buildFilter(query);

  const [targets, total] = await Promise.all([

    Target.find(filter)
      .sort({ year: -1, month: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Target.countDocuments(filter)

  ]);

  return {
    data: targets,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * =====================================
 * GET TARGET BY ID
 * =====================================
 */
const getTargetById = async (id) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid target id");
  }

  const target = await Target.findOne({
    _id: id,
    isDeleted: false
  }).lean();

  if (!target) {
    throw new ApiError(404, "Target not found");
  }

  return target;
};

/**
 * =====================================
 * UPDATE TARGET
 * =====================================
 */
const updateTarget = async (id, payload) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid target id");
  }

  const updated = await Target.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    {
      new: true,
      runValidators: true
    }
  ).lean();

  if (!updated) {
    throw new ApiError(404, "Target not found");
  }

  return updated;
};

/**
 * =====================================
 * SOFT DELETE TARGET
 * =====================================
 */
const deleteTarget = async (id) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid target id");
  }

  const deleted = await Target.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  ).lean();

  if (!deleted) {
    throw new ApiError(404, "Target not found");
  }

  return deleted;
};

/**
 * =====================================
 * TARGET VS REVENUE REPORT
 * =====================================
 */
const getTargetVsRevenue = async () => {

  return Target.aggregate([

    { $match: { isDeleted: false } },

    {
      $lookup: {
        from: "revenues",
        let: {
          month: "$month",
          year: "$year",
          department: "$department"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$month", "$$month"] },
                  { $eq: ["$year", "$$year"] },
                  { $eq: ["$department", "$$department"] },
                  { $eq: ["$isDeleted", false] }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$amount" }
            }
          }
        ],
        as: "revenue"
      }
    },

    {
      $addFields: {
        revenue: {
          $ifNull: [{ $arrayElemAt: ["$revenue.revenue", 0] }, 0]
        }
      }
    },

    {
      $addFields: {
        performance: {
          $multiply: [
            { $divide: ["$revenue", "$targetAmount"] },
            100
          ]
        }
      }
    },

    {
      $project: {
        _id: 0,
        month: 1,
        year: 1,
        department: 1,
        target: "$targetAmount",
        revenue: 1,
        performance: { $round: ["$performance", 2] }
      }
    },

    { $sort: { year: -1, month: -1 } }

  ]);
};

/**
 * =====================================
 * DEPARTMENT ANALYTICS
 * =====================================
 */
const getDepartmentTargets = async () => {

  return Target.aggregate([

    { $match: { isDeleted: false } },

    {
      $group: {
        _id: "$department",
        totalTarget: { $sum: "$targetAmount" },
        months: { $sum: 1 }
      }
    },

    {
      $project: {
        department: "$_id",
        totalTarget: 1,
        months: 1,
        avgMonthlyTarget: {
          $divide: ["$totalTarget", "$months"]
        },
        _id: 0
      }
    },

    { $sort: { totalTarget: -1 } }

  ]);
};

module.exports = {
  createTarget,
  getAllTargets,
  getTargetById,
  updateTarget,
  deleteTarget,
  getTargetVsRevenue,
  getDepartmentTargets
};