const Revenue = require("../revenue/revenue.model");
const Target = require("../target/target.model");

const getDashboardSummary = async () => {
  try {

    /* ================================
       TOTAL REVENUE
    ================================= */

    const revenueResult = await Revenue.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;


    /* ================================
       TOTAL TARGET
    ================================= */

    const targetResult = await Target.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalTarget: { $sum: "$targetAmount" }
        }
      }
    ]);

    const totalTarget = targetResult[0]?.totalTarget || 0;


    /* ================================
       ACHIEVEMENT PERCENT
    ================================= */

    const achievementPercent =
      totalTarget > 0
        ? ((totalRevenue / totalTarget) * 100)
        : 0;


    /* ================================
       MONTHLY REVENUE TREND
    ================================= */

    const monthlyRevenue = await Revenue.aggregate([
      { $match: { isDeleted: false } },

      {
        $group: {
          _id: {
            year: "$year",
            month: "$month"
          },
          revenue: { $sum: "$amount" }
        }
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);


    /* ================================
       MONTHLY GROWTH
    ================================= */

    let monthlyGrowth = 0;

    if (monthlyRevenue.length >= 2) {

      const current =
        monthlyRevenue[monthlyRevenue.length - 1].revenue;

      const previous =
        monthlyRevenue[monthlyRevenue.length - 2].revenue;

      monthlyGrowth =
        previous > 0
          ? ((current - previous) / previous) * 100
          : 0;
    }


    /* ================================
       DEPARTMENT REVENUE
    ================================= */

    const departmentStats = await Revenue.aggregate([
      { $match: { isDeleted: false } },

      {
        $group: {
          _id: "$department",
          revenue: { $sum: "$amount" }
        }
      },

      {
        $project: {
          department: "$_id",
          revenue: 1,
          _id: 0
        }
      },

      {
        $sort: { revenue: -1 }
      }
    ]);


    /* ================================
       REVENUE VS TARGET
    ================================= */

    const revenueVsTarget = await Revenue.aggregate([
      { $match: { isDeleted: false } },

      {
        $lookup: {
          from: "targets",
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
          as: "target"
        }
      },

      {
        $unwind: {
          path: "$target",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $project: {
          month: 1,
          year: 1,
          department: 1,
          revenue: "$amount",
          target: "$target.targetAmount"
        }
      }
    ]);


    /* ================================
       FINAL RESPONSE
    ================================= */

    return {

      totalRevenue,

      totalTarget,

      achievementPercent:
        Number(achievementPercent.toFixed(2)),

      monthlyGrowth:
        Number(monthlyGrowth.toFixed(2)),

      monthlyRevenue,

      departmentStats,

      revenueVsTarget

    };

  } catch (error) {

    throw new Error(
      "Dashboard summary failed: " + error.message
    );

  }
};

module.exports = {
  getDashboardSummary
};