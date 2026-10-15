const {
  getEntityPatterns,
  getSmallPaymentPattern,
  getCategoryPatterns,
  detectSpendingPatterns,
} = require('../src/services/spendingPatternService');

describe('Spending Pattern Service', () => {
  const transactions = [
    {
      amount: 50,
      type: 'DEBIT',
      category: 'food',
      entityKey: 'amruth_tea',
    },
    {
      amount: 70,
      type: 'DEBIT',
      category: 'food',
      entityKey: 'amruth_tea',
    },
    {
      amount: 200,
      type: 'DEBIT',
      category: 'shopping',
      entityKey: 'amazon',
    },
    {
      amount: 100,
      type: 'DEBIT',
      category: 'transport',
      entityKey: 'uber',
    },
    {
      amount: 500,
      type: 'CREDIT',
      category: 'other',
      entityKey: 'rahul',
    },
  ];

  test('detects repeated entity spending', () => {
    const patterns = getEntityPatterns(transactions);

    const tea = patterns.find(
      (entity) => entity.entityKey === 'amruth_tea'
    );

    expect(tea.count).toBe(2);
    expect(tea.totalAmount).toBe(120);
    expect(tea.averageAmount).toBe(60);
  });

  test('ignores credit transactions in entity patterns', () => {
    const patterns = getEntityPatterns(transactions);

    const rahul = patterns.find(
      (entity) => entity.entityKey === 'rahul'
    );

    expect(rahul).toBeUndefined();
  });

  test('detects small payment pattern', () => {
    const pattern = getSmallPaymentPattern(transactions);

    expect(pattern.count).toBe(3);
    expect(pattern.totalAmount).toBe(220);
    expect(pattern.threshold).toBe(100);
  });

  test('supports a custom small payment threshold', () => {
    const pattern = getSmallPaymentPattern(transactions, 50);

    expect(pattern.count).toBe(1);
    expect(pattern.totalAmount).toBe(50);
  });

  test('detects category spending patterns', () => {
    const patterns = getCategoryPatterns(transactions);

    const food = patterns.find(
      (category) => category.category === 'food'
    );

    expect(food.count).toBe(2);
    expect(food.totalAmount).toBe(120);
  });

  test('returns all spending patterns together', () => {
    const patterns = detectSpendingPatterns(transactions);

    expect(patterns.entityPatterns).toHaveLength(3);
    expect(patterns.smallPaymentPattern.count).toBe(3);
    expect(patterns.categoryPatterns).toHaveLength(3);
  });

  test('handles empty transactions', () => {
    const patterns = detectSpendingPatterns([]);

    expect(patterns.entityPatterns).toEqual([]);
    expect(patterns.categoryPatterns).toEqual([]);
    expect(patterns.smallPaymentPattern.count).toBe(0);
    expect(patterns.smallPaymentPattern.totalAmount).toBe(0);
  });
});