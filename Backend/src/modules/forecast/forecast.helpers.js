// ==========================
// forecast.helpers.js
// ==========================

/**
 * Generate future months labels
 */
const generateFutureMonths = (count = 6) => {
  const months = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }

  return months;
};

/**
 * Moving Average Forecast
 */
const movingAverageForecast = (data, periods = 3, months = 6) => {
  if (!Array.isArray(data) || data.length < periods) return [];

  const forecasts = [];
  let dataset = [...data];

  for (let i = 0; i < months; i++) {
    const last = dataset.slice(-periods);
    const avg = last.reduce((sum, val) => sum + val, 0) / last.length;
    const prediction = Math.round(avg);
    forecasts.push(prediction);
    dataset.push(prediction);
  }

  return forecasts;
};

/**
 * Weighted Moving Average Forecast
 */
const weightedMovingAverageForecast = (data, weights = [0.5, 0.3, 0.2], months = 6) => {
  if (!Array.isArray(data) || data.length < weights.length) return [];

  const forecasts = [];
  let dataset = [...data];
  const periods = weights.length;

  for (let i = 0; i < months; i++) {
    const last = dataset.slice(-periods);
    const prediction = Math.round(
      last.reduce((sum, val, idx) => sum + val * weights[idx], 0)
    );
    forecasts.push(prediction);
    dataset.push(prediction);
  }

  return forecasts;
};

/**
 * Growth Trend Forecast
 */
const growthTrendForecast = (data, months = 6) => {
  if (!Array.isArray(data) || data.length < 2) return [];

  const forecasts = [];
  let lastValue = data[data.length - 1];

  const growthRates = data.slice(1).map((curr, i) => {
    const prev = data[i];
    return prev > 0 ? (curr - prev) / prev : 0;
  });

  const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;

  for (let i = 0; i < months; i++) {
    lastValue = lastValue * (1 + avgGrowth);
    forecasts.push(Math.round(lastValue));
  }

  return forecasts;
};

module.exports = {
  generateFutureMonths,
  movingAverageForecast,
  weightedMovingAverageForecast,
  growthTrendForecast
};