function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getNextMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function getPreviousMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function getSpendingPeriods(transactions = []) {
  if (!transactions.length) {
    return {
      currentStart: null,
      currentEnd: null,
      previousStart: null,
      previousEnd: null,
      currentTransactions: [],
      previousTransactions: [],
    };
  }

  const validTransactions = transactions
    .filter((transaction) => transaction.date)
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  if (!validTransactions.length) {
    return {
      currentStart: null,
      currentEnd: null,
      previousStart: null,
      previousEnd: null,
      currentTransactions: [],
      previousTransactions: [],
    };
  }

  const latestDate = new Date(
    validTransactions[validTransactions.length - 1].date
  );

  const currentStart = getMonthStart(latestDate);
  const currentEnd = getNextMonthStart(latestDate);
  const previousStart = getPreviousMonthStart(latestDate);
  const previousEnd = currentStart;

  const currentTransactions = validTransactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date >= currentStart && date < currentEnd;
  });

  const previousTransactions = validTransactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date >= previousStart && date < previousEnd;
  });

  return {
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
    currentTransactions,
    previousTransactions,
  };
}

module.exports = {
  getSpendingPeriods,
};