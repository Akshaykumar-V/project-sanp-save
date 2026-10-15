const {
  compareEntitySpending,
  getSpendingChanges,
} = require('../src/services/spendingComparisonService');

describe('Spending Comparison Service', () => {
  const previousTransactions = [
    {
      amount: 100,
      type: 'DEBIT',
      entityKey: 'amruth_tea',
    },
    {
      amount: 120,
      type: 'DEBIT',
      entityKey: 'amruth_tea',
    },
    {
      amount: 500,
      type: 'DEBIT',
      entityKey: 'zomato',
    },
  ];

  const currentTransactions = [
    {
      amount: 150,
      type: 'DEBIT',
      entityKey: 'amruth_tea',
    },
    {
      amount: 270,
      type: 'DEBIT',
      entityKey: 'amruth_tea',
    },
    {
      amount: 300,
      type: 'DEBIT',
      entityKey: 'zomato',
    },
  ];

  test('compares spending for the same entity', () => {
    const result = compareEntitySpending(
      previousTransactions,
      currentTransactions
    );

    const tea = result.find(
      (item) => item.entityKey === 'amruth_tea'
    );

    expect(tea.previousAmount).toBe(220);
    expect(tea.currentAmount).toBe(420);
    expect(tea.changeAmount).toBe(200);
    expect(tea.changePercentage).toBeCloseTo(90.91, 2);
  });

  test('detects decreased spending', () => {
    const result = compareEntitySpending(
      previousTransactions,
      currentTransactions
    );

    const zomato = result.find(
      (item) => item.entityKey === 'zomato'
    );

    expect(zomato.previousAmount).toBe(500);
    expect(zomato.currentAmount).toBe(300);
    expect(zomato.changeAmount).toBe(-200);
    expect(zomato.changePercentage).toBe(-40);
  });

  test('handles a new entity with no previous spending', () => {
    const result = compareEntitySpending(
      [],
      [
        {
          amount: 250,
          type: 'DEBIT',
          entityKey: 'swiggy',
        },
      ]
    );

    expect(result[0].previousAmount).toBe(0);
    expect(result[0].currentAmount).toBe(250);
    expect(result[0].changeAmount).toBe(250);
    expect(result[0].changePercentage).toBeNull();
  });

  test('ignores credit transactions', () => {
    const result = compareEntitySpending(
      [
        {
          amount: 500,
          type: 'CREDIT',
          entityKey: 'rahul',
        },
      ],
      []
    );

    expect(result).toEqual([]);
  });

  test('returns only entities whose spending changed', () => {
    const result = getSpendingChanges(
      [
        {
          amount: 100,
          type: 'DEBIT',
          entityKey: 'tea',
        },
      ],
      [
        {
          amount: 100,
          type: 'DEBIT',
          entityKey: 'tea',
        },
        {
          amount: 200,
          type: 'DEBIT',
          entityKey: 'zomato',
        },
      ]
    );

    expect(result).toHaveLength(1);
    expect(result[0].entityKey).toBe('zomato');
  });

  test('handles empty periods', () => {
    expect(compareEntitySpending([], [])).toEqual([]);
    expect(getSpendingChanges([], [])).toEqual([]);
  });
});