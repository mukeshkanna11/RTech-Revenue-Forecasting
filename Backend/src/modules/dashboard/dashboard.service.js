// src/modules/dashboard/dashboard.service.js

const Revenue = require("../revenue/revenue.model");
const Client = require("../clients/client.model");
const Invoice = require("../invoice/invoice.model");

/**
 * Fetch dashboard summary
 */
async function getDashboardSummary() {
  try {
    // Total Revenue
    const totalRevenueAgg = await Revenue.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Monthly Revenue for chart (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);

    const monthlyRevenueAgg = await Revenue.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Active clients count
    const activeClients = await Client.countDocuments({ isActive: true });

    // Total invoices
    const invoicesCount = await Invoice.countDocuments();

    // Top clients by revenue
    const topClientsAgg = await Revenue.aggregate([
      {
        $group: {
          _id: "$client",
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "clientInfo",
        },
      },
      { $unwind: "$clientInfo" },
      {
        $project: {
          _id: 0,
          name: "$clientInfo.name",
          revenue: 1,
          img: "$clientInfo.avatar", // optional: client image
        },
      },
    ]);

    return {
      totalRevenue,
      monthlyRevenue: monthlyRevenueAgg,
      activeClients,
      invoices: invoicesCount,
      topClients: topClientsAgg,
      monthlyGrowth: 0, // optional, calculate from last month
    };
  } catch (error) {
    console.error("[DashboardService] getDashboardSummary:", error);
    throw new Error("Failed to fetch dashboard summary");
  }
}

module.exports = { getDashboardSummary };