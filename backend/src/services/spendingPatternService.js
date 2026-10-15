function getEntityPatterns(transactions = []) {
  const entities = {};

  for (const transaction of transactions) {
    if (transaction.type !== 'DEBIT') {
      continue;
    }

    const entityKey = transaction.entityKey || transaction.merchant;

    if (!entityKey) {
      continue;
    }

    if (!entities[entityKey]) {
      entities[entityKey] = {
        entityKey,
        count: 0,
        totalAmount: 0,
        averageAmount: 0,
      };
    }

    entities[entityKey].count += 1;
    entities[entityKey].totalAmount += Number(transaction.amount) || 0;
  }

  return Object.values(entities).map((entity) => ({
    ...entity,
    averageAmount:
      entity.count > 0 ? entity.totalAmount / entity.count : 0,
  }));
}

function getSmallPaymentPattern(transactions = [], threshold = 100) {
  const smallPayments = transactions.filter(
    (transaction) =>
      transaction.type === 'DEBIT' &&
      Number(transaction.amount) <= threshold
  );

  const totalAmount = smallPayments.reduce(
    (total, transaction) => total + (Number(transaction.amount) || 0),
    0
  );

  return {
    threshold,
    count: smallPayments.length,
    totalAmount,
    averageAmount:
      smallPayments.length > 0
        ? totalAmount / smallPayments.length
        : 0,
  };
}

function getCategoryPatterns(transactions = []) {
  const categories = {};

  for (const transaction of transactions) {
    if (transaction.type !== 'DEBIT') {
      continue;
    }

    const category = transaction.category || 'other';

    if (!categories[category]) {
      categories[category] = {
        category,
        count: 0,
        totalAmount: 0,
      };
    }

    categories[category].count += 1;
    categories[category].totalAmount += Number(transaction.amount) || 0;
  }

  return Object.values(categories);
}

function detectSpendingPatterns(transactions = []) {
  return {
    entityPatterns: getEntityPatterns(transactions),
    smallPaymentPattern: getSmallPaymentPattern(transactions),
    categoryPatterns: getCategoryPatterns(transactions),
  };
}

module.exports = {
  getEntityPatterns,
  getSmallPaymentPattern,
  getCategoryPatterns,
  detectSpendingPatterns,
};