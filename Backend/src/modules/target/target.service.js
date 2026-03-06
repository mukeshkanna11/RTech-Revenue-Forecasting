const Target = require("./target.model");
const Revenue = require("../revenue/revenue.model");
const ApiError = require("../../utils/ApiError");

/**
 * ================================
 * CREATE TARGET
 * ================================
 */
const createTarget = async (payload) => {

  const existing = await Target.findOne({
    month: payload.month,
    year: payload.year,
    department: payload.department,
    isDeleted: false
  });

  if (existing) {
    throw new ApiError(
      400,
      "Target already exists for this month, year, and department"
    );
  }

  return await Target.create(payload);
};


/**
 * ================================
 * GET ALL TARGETS (Pagination + Filters)
 * ================================
 */
const getAllTargets = async (query) => {

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const filter = { isDeleted: false };

  if (query.year) filter.year = query.year;
  if (query.department) filter.department = query.department;

  const targets = await Target.find(filter)
    .sort({ year: -1, month: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Target.countDocuments(filter);

  return {
    data: targets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};


/**
 * ================================
 * GET TARGET BY ID
 * ================================
 */
const getTargetById = async (id) => {

  const target = await Target.findOne({
    _id: id,
    isDeleted: false
  });

  if (!target) {
    throw new ApiError(404, "Target not found");
  }

  return target;
};


/**
 * ================================
 * UPDATE TARGET
 * ================================
 */
const updateTarget = async (id, payload) => {

  const target = await Target.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  );

  if (!target) {
    throw new ApiError(404, "Target not found");
  }

  return target;
};


/**
 * ================================
 * SOFT DELETE TARGET
 * ================================
 */
const deleteTarget = async (id) => {

  const target = await Target.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!target) {
    throw new ApiError(404, "Target not found");
  }

  return target;
};


/**
 * ================================
 * TARGET VS REVENUE REPORT
 * ================================
 */
const getTargetVsRevenue = async () => {

  const report = await Target.aggregate([

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
          }
        ],
        as: "revenue"
      }
    },

    {
      $unwind: {
        path: "$revenue",
        preserveNullAndEmptyArrays: true
      }
    },

    {
      $project: {
        month: 1,
        year: 1,
        department: 1,
        target: "$targetAmount",
        revenue: "$revenue.amount"
      }
    }

  ]);

  return report;
};


/**
 * ================================
 * DEPARTMENT TARGET ANALYTICS
 * ================================
 */
const getDepartmentTargets = async () => {

  return await Target.aggregate([

    { $match: { isDeleted: false } },

    {
      $group: {
        _id: "$department",
        totalTarget: { $sum: "$targetAmount" }
      }
    },

    {
      $project: {
        department: "$_id",
        totalTarget: 1,
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