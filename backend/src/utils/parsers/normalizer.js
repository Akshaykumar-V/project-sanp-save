function normalizeTransaction(transaction) {
  return {
    date: transaction.date,
    merchant: transaction.merchant || 'Unknown Merchant',
    amount: Number(transaction.amount),
    type: transaction.type,
    category: transaction.category || 'other',
    ...Object.fromEntries(
      ['transactionId', 'utrNumber', 'provider', 'entityKey', 'entityType', 'transactionRole']
        .filter((key) => transaction[key] !== undefined)
        .map((key) => [key, transaction[key]])
    ),
    rawText: transaction.rawText
      ? String(transaction.rawText).slice(0, 200)
      : '',
  };
}

function normalizeTransactions(transactions) {
  if (!Array.isArray(transactions)) {
    return [];
  }

  return transactions
    .map(normalizeTransaction)
    .filter(
      (transaction) =>
        transaction.date instanceof Date &&
        Number.isFinite(transaction.date.getTime()) &&
        ['DEBIT', 'CREDIT'].includes(transaction.type) &&
        Number.isFinite(transaction.amount) &&
        transaction.amount > 0
    );
}

module.exports = {
  normalizeTransaction,
  normalizeTransactions,
};
