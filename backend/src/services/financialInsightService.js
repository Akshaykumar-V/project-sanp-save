function buildFinancialInsights({
  profile = {},
  patterns = {},
  comparisons = [],
} = {}) {
  const insights = [];

  // 1. Spending increase/decrease
  for (const comparison of comparisons) {
    if (comparison.changeAmount <= 0) {
  continue;
}

const meaningfulAmountChange =
  comparison.changeAmount >= 100;

const meaningfulPercentageChange =
  comparison.changePercentage !== null &&
  comparison.changePercentage >= 25;

if (
  comparison.previousAmount > 0 &&
  !meaningfulAmountChange &&
  !meaningfulPercentageChange
) {
  continue;
}

    if (comparison.previousAmount <= 0) {
      insights.push({
        type: 'NEW_SPENDING',
        entityKey: comparison.entityKey,
        currentAmount: comparison.currentAmount,
        message: `New spending detected for ${comparison.entityKey}.`,
      });

      continue;
    }

    insights.push({
      type: 'SPENDING_INCREASE',
      entityKey: comparison.entityKey,
      previousAmount: comparison.previousAmount,
      currentAmount: comparison.currentAmount,
      changeAmount: comparison.changeAmount,
      changePercentage: comparison.changePercentage,
      message:
        `Spending increased for ${comparison.entityKey} ` +
        `by ${comparison.changeAmount.toFixed(2)}.`,
    });
  }

  // 2. Repeated spending entities
  const entityPatterns = patterns.entityPatterns || [];

  for (const entity of entityPatterns) {
    if (entity.count < 3) {
      continue;
    }

    insights.push({
      type: 'REPEATED_SPENDING',
      entityKey: entity.entityKey,
      count: entity.count,
      totalAmount: entity.totalAmount,
      averageAmount: entity.averageAmount,
      message:
        `${entity.entityKey} appears ${entity.count} times ` +
        `in your spending history.`,
    });
  }

  // 3. Small-payment pattern
  const smallPaymentPattern = patterns.smallPaymentPattern;

  if (
    smallPaymentPattern &&
    smallPaymentPattern.count >= 5
  ) {
    insights.push({
      type: 'SMALL_PAYMENT_PATTERN',
      count: smallPaymentPattern.count,
      totalAmount: smallPaymentPattern.totalAmount,
      averageAmount: smallPaymentPattern.averageAmount,
      threshold: smallPaymentPattern.threshold,
      message:
        `${smallPaymentPattern.count} small payments ` +
        `added up to ${smallPaymentPattern.totalAmount.toFixed(2)}.`,
    });
  }

  // 4. Basic profile context
  if (profile.totalSpent > 0) {
    insights.push({
      type: 'SPENDING_PROFILE',
      totalSpent: profile.totalSpent,
      expenseCount: profile.expenseCount,
      averageExpense: profile.averageExpense,
      largestExpense: profile.largestExpense,
    });
  }

  return insights;
}

module.exports = {
  buildFinancialInsights,
};