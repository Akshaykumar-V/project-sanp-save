function compareEntitySpending(previousTransactions = [], currentTransactions = []) {
  const buildTotals = (transactions) => {
    const totals = {};

    for (const transaction of transactions) {
      if (transaction.type !== 'DEBIT') {
        continue;
      }

      const entityKey = transaction.entityKey || transaction.merchant;

      if (!entityKey) {
        continue;
      }

      totals[entityKey] =
        (totals[entityKey] || 0) + (Number(transaction.amount) || 0);
    }

    return totals;
  };

  const previousTotals = buildTotals(previousTransactions);
  const currentTotals = buildTotals(currentTransactions);

  const entityKeys = new Set([
    ...Object.keys(previousTotals),
    ...Object.keys(currentTotals),
  ]);

  return [...entityKeys].map((entityKey) => {
    const previousAmount = previousTotals[entityKey] || 0;
    const currentAmount = currentTotals[entityKey] || 0;
    const changeAmount = currentAmount - previousAmount;

    const changePercentage =
      previousAmount > 0
        ? (changeAmount / previousAmount) * 100
        : currentAmount > 0
          ? null
          : 0;

    return {
      entityKey,
      previousAmount,
      currentAmount,
      changeAmount,
      changePercentage,
    };
  });
}

function getSpendingChanges(
  previousTransactions = [],
  currentTransactions = []
) {
  const comparisons = compareEntitySpending(
    previousTransactions,
    currentTransactions
  );

  return comparisons.filter(
    (comparison) =>
      comparison.changeAmount !== 0
  );
}

module.exports = {
  compareEntitySpending,
  getSpendingChanges,
};