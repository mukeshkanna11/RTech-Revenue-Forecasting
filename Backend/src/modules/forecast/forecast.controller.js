const {
  forecastRevenue,
  forecastByDepartment
} = require("./forecast.service");

/**
 * ================================
 * FORECAST REVENUE
 * ================================
 */

const getForecast = async (req, res, next) => {

  try {

    const months =
      Number(req.query.months) || 6;

    const forecast =
      await forecastRevenue(months);

    res.status(200).json({

      success: true,

      data: forecast

    });

  } catch (error) {

    next(error);

  }

};


/**
 * ================================
 * DEPARTMENT FORECAST
 * ================================
 */

const getDepartmentForecast =
async (req, res, next) => {

  try {

    const { department } = req.params;

    const months =
      Number(req.query.months) || 6;

    const forecast =
      await forecastByDepartment(
        department,
        months
      );

    res.status(200).json({

      success: true,

      department,

      forecast

    });

  } catch (error) {

    next(error);

  }

};


module.exports = {

  getForecast,

  getDepartmentForecast

};