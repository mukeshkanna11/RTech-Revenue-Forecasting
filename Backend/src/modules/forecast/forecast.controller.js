// ==========================
// forecast.controller.js
// ==========================
const { forecastRevenue, forecastByDepartment } = require("./forecast.service");

/**
 * GET /api/forecast?months=6
 */
const getForecast = async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 6;
    const data = await forecastRevenue(months);

    res.status(200).json({ success: true, data, meta: { months } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/forecast/department/:department?months=6
 */
const getDepartmentForecast = async (req, res, next) => {
  try {
    const { department } = req.params;
    const months = Number(req.query.months) || 6;

    const forecast = await forecastByDepartment(department, months);

    res.status(200).json({ success: true, department, forecast, meta: { months } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getForecast, getDepartmentForecast };