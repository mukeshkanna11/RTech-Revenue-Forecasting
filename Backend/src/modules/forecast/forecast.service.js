const Revenue = require("../revenue/revenue.model");
const ApiError = require("../../utils/ApiError");

/**
 * =================================================
 * HELPER: Generate Next Months Labels
 * =================================================
 */

const generateFutureMonths = (count) => {
  const months = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);

    months.push({
      month: d.getMonth() + 1,
      year: d.getFullYear()
    });
  }

  return months;
};

/**
 * =================================================
 * MOVING AVERAGE FORECAST
 * =================================================
 */

const movingAverageForecast = (data, periods = 3, months = 6) => {

  const forecasts = [];
  let dataset = [...data];

  for (let i = 0; i < months; i++) {

    const last = dataset.slice(-periods);

    const avg =
      last.reduce((a, b) => a + b, 0) / last.length;

    const predicted = Math.round(avg);

    forecasts.push(predicted);

    dataset.push(predicted);
  }

  return forecasts;
};

/**
 * =================================================
 * WEIGHTED MOVING AVERAGE FORECAST
 * =================================================
 */

const weightedMovingAverageForecast = (
  data,
  weights = [0.5, 0.3, 0.2],
  months = 6
) => {

  const forecasts = [];
  let dataset = [...data];

  const periods = weights.length;

  for (let i = 0; i < months; i++) {

    const last = dataset.slice(-periods);

    let prediction = 0;

    for (let j = 0; j < last.length; j++) {

      prediction += last[j] * weights[j];

    }

    prediction = Math.round(prediction);

    forecasts.push(prediction);

    dataset.push(prediction);
  }

  return forecasts;
};

/**
 * =================================================
 * GROWTH TREND FORECAST
 * =================================================
 */

const growthTrendForecast = (data, months = 6) => {

  const forecasts = [];
  let lastValue = data[data.length - 1];

  const growthRates = [];

  for (let i = 1; i < data.length; i++) {

    const prev = data[i - 1];
    const curr = data[i];

    if (prev > 0) {
      growthRates.push((curr - prev) / prev);
    }
  }

  const avgGrowth =
    growthRates.reduce((a, b) => a + b, 0) /
    (growthRates.length || 1);

  for (let i = 0; i < months; i++) {

    lastValue = lastValue * (1 + avgGrowth);

    forecasts.push(Math.round(lastValue));
  }

  return forecasts;
};

/**
 * =================================================
 * MAIN FORECAST ENGINE
 * =================================================
 */

const forecastRevenue = async (months = 6) => {

  const revenues = await Revenue.find({
    isDeleted: false
  }).sort({ year: 1, month: 1 });

  if (revenues.length < 3) {
    throw new ApiError(
      400,
      "Minimum 3 months revenue required for forecasting"
    );
  }

  const amounts = revenues.map((r) => r.amount);

  const movingAvg =
    movingAverageForecast(amounts, 3, months);

  const weightedAvg =
    weightedMovingAverageForecast(amounts, [0.5, 0.3, 0.2], months);

  const trend =
    growthTrendForecast(amounts, months);

  const futureMonths = generateFutureMonths(months);

  const forecast = futureMonths.map((m, i) => ({
    month: m.month,
    year: m.year,
    movingAverage: movingAvg[i],
    weightedAverage: weightedAvg[i],
    trendForecast: trend[i]
  }));

  return {
    history: revenues,
    forecast
  };
};

/**
 * =================================================
 * DEPARTMENT FORECAST
 * =================================================
 */

const forecastByDepartment = async (
  department,
  months = 6
) => {

  const revenues = await Revenue.find({
    department,
    isDeleted: false
  }).sort({ year: 1, month: 1 });

  if (revenues.length < 3) {

    throw new ApiError(
      400,
      "Not enough data for department forecast"
    );
  }

  const amounts = revenues.map((r) => r.amount);

  const forecast =
    movingAverageForecast(amounts, 3, months);

  const futureMonths = generateFutureMonths(months);

  return futureMonths.map((m, i) => ({
    department,
    month: m.month,
    year: m.year,
    predictedRevenue: forecast[i]
  }));
};

/**
 * =================================================
 * EXPORTS
 * =================================================
 */

module.exports = {
  forecastRevenue,
  forecastByDepartment
};