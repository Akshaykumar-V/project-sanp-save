const Transaction = require('../models/Transaction');

function buildSpendingProfile(transactions = []) {
  const profile = {
    totalSpent: 0,
    totalReceived: 0,
    transactionCount: transactions.length,
    expenseCount: 0,
    incomeCount: 0,
    averageExpense: 0,
    largestExpense: 0,
    categoryTotals: {},
    entityTotals: {},
    smallPaymentCount: 0,
    smallPaymentTotal: 0,
  };

  for (const transaction of transactions) {
    const amount = Number(transaction.amount) || 0;

    if (transaction.type === 'DEBIT') {
      profile.totalSpent += amount;
      profile.expenseCount += 1;

      profile.largestExpense = Math.max(
        profile.largestExpense,
        amount
      );

      if (amount <= 100) {
        profile.smallPaymentCount += 1;
        profile.smallPaymentTotal += amount;
      }

      const category = transaction.category || 'other';
      profile.categoryTotals[category] =
        (profile.categoryTotals[category] || 0) + amount;

      const entityKey = transaction.entityKey || transaction.merchant;

      if (entityKey) {
        profile.entityTotals[entityKey] =
          (profile.entityTotals[entityKey] || 0) + amount;
      }
    }

    if (transaction.type === 'CREDIT') {
      profile.totalReceived += amount;
      profile.incomeCount += 1;
    }
  }

  if (profile.expenseCount > 0) {
    profile.averageExpense =
      profile.totalSpent / profile.expenseCount;
  }

  return profile;
}

async function getSpendingProfile(userId, startDate, endDate) {
  const query = {
    user: userId,
  };

  if (startDate || endDate) {
    query.date = {};

    if (startDate) {
      query.date.$gte = new Date(startDate);
    }

    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  const transactions = await Transaction.find(query)
    .sort({ date: 1 })
    .lean();

  return buildSpendingProfile(transactions);
}

module.exports = {
  buildSpendingProfile,
  getSpendingProfile,
};