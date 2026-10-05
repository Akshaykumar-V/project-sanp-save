const {
  getSpendingPeriods,
} = require('../src/services/spendingPeriodService');

describe('Spending Period Service', () => {
  test('splits transactions into current and previous calendar months', () => {
    const transactions = [
      {
        date: '2026-09-05',
        amount: 100,
        type: 'DEBIT',
      },
      {
        date: '2026-09-20',
        amount: 200,
        type: 'DEBIT',
      },
      {
        date: '2026-10-01',
        amount: 300,
        type: 'DEBIT',
      },
      {
        date: '2026-10-05',
        amount: 400,
        type: 'DEBIT',
      },
    ];

    const result = getSpendingPeriods(transactions);

    expect(result.previousTransactions).toHaveLength(2);
    expect(result.currentTransactions).toHaveLength(2);

    expect(result.previousTransactions[0].amount).toBe(100);
    expect(result.previousTransactions[1].amount).toBe(200);

    expect(result.currentTransactions[0].amount).toBe(300);
    expect(result.currentTransactions[1].amount).toBe(400);
  });

  test('uses the latest transaction month as the current period', () => {
    const transactions = [
      {
        date: '2026-08-15',
        amount: 100,
        type: 'DEBIT',
      },
      {
        date: '2026-10-05',
        amount: 500,
        type: 'DEBIT',
      },
    ];

    const result = getSpendingPeriods(transactions);

    expect(result.currentTransactions).toHaveLength(1);
    expect(result.currentTransactions[0].amount).toBe(500);

    expect(result.previousTransactions).toHaveLength(0);
  });

  test('handles transactions from different years', () => {
    const transactions = [
      {
        date: '2025-12-15',
        amount: 250,
        type: 'DEBIT',
      },
      {
        date: '2026-01-05',
        amount: 450,
        type: 'DEBIT',
      },
    ];

    const result = getSpendingPeriods(transactions);

    expect(result.previousTransactions).toHaveLength(1);
    expect(result.currentTransactions).toHaveLength(1);

    expect(result.previousTransactions[0].amount).toBe(250);
    expect(result.currentTransactions[0].amount).toBe(450);
  });

  test('returns empty periods when transactions are empty', () => {
    const result = getSpendingPeriods([]);

    expect(result.currentTransactions).toEqual([]);
    expect(result.previousTransactions).toEqual([]);

    expect(result.currentStart).toBeNull();
    expect(result.previousStart).toBeNull();
  });

  test('ignores transactions without dates when determining periods', () => {
    const transactions = [
      {
        amount: 999,
        type: 'DEBIT',
      },
      {
        date: '2026-10-05',
        amount: 500,
        type: 'DEBIT',
      },
    ];

    const result = getSpendingPeriods(transactions);

    expect(result.currentTransactions).toHaveLength(1);
    expect(result.currentTransactions[0].amount).toBe(500);
  });
});