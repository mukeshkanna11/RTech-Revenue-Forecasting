// ==========================
// forecast.service.js (SaaS-level robust)
// ==========================
const Revenue = require("../revenue/revenue.model");
const ApiError = require("../../utils/ApiError");
const {
  generateFutureMonths,
  movingAverageForecast,
  weightedMovingAverageForecast,
  growthTrendForecast
} = require("./forecast.helpers");

/**
 * Forecast revenue (global)
 */
const forecastRevenue = async (months = 6) => {
  const revenues = await Revenue.find({ isDeleted: false }).sort({ year: 1, month: 1 });

  if (!revenues || revenues.length < 1) {
    throw new ApiError(400, "At least 1 month of revenue required for forecasting.");
  }

  const amounts = revenues.map(r => r.amount);
  const forecastMonths = generateFutureMonths(months);

  // Use available data, fallback if < 3 months
  const periods = Math.min(3, amounts.length);

  const movingAvg = movingAverageForecast(amounts, periods, months);
  const weightedAvg = weightedMovingAverageForecast(amounts, [0.5, 0.3, 0.2].slice(0, periods), months);
  const trend = growthTrendForecast(amounts, months);

  const forecast = forecastMonths.map((m, i) => ({
    month: m.month,
    year: m.year,
    movingAverage: movingAvg[i],
    weightedAverage: weightedAvg[i],
    trendForecast: trend[i]
  }));

  return { history: revenues, forecast };
};

/**
 * Forecast by department (robust, even < 3 months)
 */
const forecastByDepartment = async (department, months = 6) => {
  if (!department) throw new ApiError(400, "Department is required.");

  const revenues = await Revenue.find({ department, isDeleted: false }).sort({ year: 1, month: 1 });

  const dataCount = revenues.length;

  const forecastMonths = generateFutureMonths(months);

  if (dataCount === 0) {
    // No data at all, return zeros
    return forecastMonths.map(m => ({
      department,
      month: m.month,
      year: m.year,
      predictedRevenue: 0,
      note: "No historical data available"
    }));
  }

  const amounts = revenues.map(r => r.amount);

  // Determine periods dynamically (use available data if < 3 months)
  const periods = Math.min(3, amounts.length);

  const forecastValues = movingAverageForecast(amounts, periods, months);

  return forecastMonths.map((m, i) => ({
    department,
    month: m.month,
    year: m.year,
    predictedRevenue: forecastValues[i],
    dataPointsUsed: dataCount, // Show how many months of data were used
    note: dataCount < 3 ? "Forecast based on limited data" : "Forecast based on full data"
  }));
};

module.exports = { forecastRevenue, forecastByDepartment };