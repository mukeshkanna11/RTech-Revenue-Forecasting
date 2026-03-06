exports.calculateForecast = (revenues) => {
  if (revenues.length < 2) {
    return { message: "Not enough data" };
  }

  const amounts = revenues.map(r => r.amount);
  const growthRates = [];

  for (let i = 1; i < amounts.length; i++) {
    const growth = (amounts[i] - amounts[i - 1]) / amounts[i - 1];
    growthRates.push(growth);
  }

  const avgGrowth =
    growthRates.reduce((a, b) => a + b, 0) / growthRates.length;

  const lastAmount = amounts[amounts.length - 1];

  return {
    averageGrowthRate: avgGrowth,
    nextMonthPrediction: Math.round(lastAmount * (1 + avgGrowth))
  };
};