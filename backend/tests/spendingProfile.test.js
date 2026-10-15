const {
  buildSpendingProfile,
} = require('../src/services/spendingProfileService');

describe('Spending Profile', () => {
  test('calculates total spending and income', () => {
    const transactions = [
      {
        amount: 500,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'zomato',
      },
      {
        amount: 200,
        type: 'CREDIT',
        category: 'other',
        entityKey: 'rahul',
      },
      {
        amount: 300,
        type: 'DEBIT',
        category: 'transport',
        entityKey: 'uber',
      },
    ];

    const profile = buildSpendingProfile(transactions);

    expect(profile.totalSpent).toBe(800);
    expect(profile.totalReceived).toBe(200);
    expect(profile.expenseCount).toBe(2);
    expect(profile.incomeCount).toBe(1);
  });

  test('calculates average and largest expense', () => {
    const transactions = [
      {
        amount: 100,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'tea',
      },
      {
        amount: 400,
        type: 'DEBIT',
        category: 'shopping',
        entityKey: 'amazon',
      },
      {
        amount: 200,
        type: 'DEBIT',
        category: 'transport',
        entityKey: 'uber',
      },
    ];

    const profile = buildSpendingProfile(transactions);

    expect(profile.averageExpense).toBeCloseTo(233.33, 2);
    expect(profile.largestExpense).toBe(400);
  });

  test('calculates category totals', () => {
    const transactions = [
      {
        amount: 100,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'tea',
      },
      {
        amount: 200,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'zomato',
      },
      {
        amount: 300,
        type: 'DEBIT',
        category: 'shopping',
        entityKey: 'amazon',
      },
    ];

    const profile = buildSpendingProfile(transactions);

    expect(profile.categoryTotals.food).toBe(300);
    expect(profile.categoryTotals.shopping).toBe(300);
  });

  test('calculates entity totals', () => {
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
        amount: 100,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'zomato',
      },
    ];

    const profile = buildSpendingProfile(transactions);

    expect(profile.entityTotals.amruth_tea).toBe(120);
    expect(profile.entityTotals.zomato).toBe(100);
  });

  test('tracks small payments of 100 or less', () => {
    const transactions = [
      {
        amount: 50,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'tea',
      },
      {
        amount: 100,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'tea',
      },
      {
        amount: 150,
        type: 'DEBIT',
        category: 'food',
        entityKey: 'zomato',
      },
    ];

    const profile = buildSpendingProfile(transactions);

    expect(profile.smallPaymentCount).toBe(2);
    expect(profile.smallPaymentTotal).toBe(150);
  });

  test('returns an empty profile when there are no transactions', () => {
    const profile = buildSpendingProfile([]);

    expect(profile.totalSpent).toBe(0);
    expect(profile.totalReceived).toBe(0);
    expect(profile.transactionCount).toBe(0);
    expect(profile.expenseCount).toBe(0);
    expect(profile.averageExpense).toBe(0);
    expect(profile.largestExpense).toBe(0);
  });
});