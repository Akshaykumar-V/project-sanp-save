const { categorize } = require('../src/utils/categorize');

describe('Transaction Categorizer', () => {
  test('categorizes food merchants', () => {
    expect(categorize('Swiggy')).toBe('food');
    expect(categorize('Zomato')).toBe('food');
  });

  test('categorizes transport merchants', () => {
    expect(categorize('Uber')).toBe('transport');
    expect(categorize('IRCTC')).toBe('transport');
  });

  test('categorizes shopping merchants', () => {
    expect(categorize('Amazon')).toBe('shopping');
    expect(categorize('Flipkart')).toBe('shopping');
  });

  test('categorizes health merchants', () => {
    expect(categorize('Apollo Pharmacy')).toBe('health');
    expect(categorize('Hospital')).toBe('health');
  });

  test('categorizes recharge and bill payments', () => {
    expect(categorize('Airtel Recharge')).toBe('recharge');
    expect(categorize('Electricity Bill')).toBe('recharge');
  });

  test('categorizes transfers', () => {
    expect(categorize('Salary Transfer')).toBe('transfers');
    expect(categorize('Received From Rahul')).toBe('transfers');
  });

  test('uses the more specific keyword when multiple keywords match', () => {
    expect(categorize('Amazon Prime')).toBe('entertainment');
    expect(categorize('Jio Cinema')).toBe('entertainment');
  });

  test('returns other for unknown merchants', () => {
    expect(categorize('Random Merchant XYZ')).toBe('other');
  });

  test('handles empty merchant names', () => {
    expect(categorize('')).toBe('other');
    expect(categorize(null)).toBe('other');
    expect(categorize(undefined)).toBe('other');
  });

  test('handles different letter cases', () => {
    expect(categorize('SWIGGY')).toBe('food');
    expect(categorize('AMAZON PRIME')).toBe('entertainment');
  });
});