const {
  parsePhonePe,
  parsePhonePeLine,
} = require('../../src/utils/parsers/phonepeParser');

describe('parsePhonePe', () => {
  test('parses a debit transaction', () => {
    const result = parsePhonePe(
      '12/09/2026 Paid to Swiggy ₹450'
    );

    expect(result).toHaveLength(1);
    expect(result[0].merchant).toBe('Swiggy');
    expect(result[0].amount).toBe(450);
    expect(result[0].type).toBe('DEBIT');
    expect(result[0].category).toBe('food');
  });

  test('parses a credit transaction', () => {
    const result = parsePhonePe(
      '13/09/2026 Received from Rahul ₹2,000'
    );

    expect(result).toHaveLength(1);
    expect(result[0].merchant).toBe('Rahul');
    expect(result[0].amount).toBe(2000);
    expect(result[0].type).toBe('CREDIT');
  });

  test('rejects an invalid date', () => {
    const result = parsePhonePe(
      '31/02/2026 Paid to Swiggy ₹450'
    );

    expect(result).toHaveLength(0);
  });

  test('returns no transactions for empty input', () => {
    expect(parsePhonePe('')).toEqual([]);
  });

  test('rejects a line without a date', () => {
    expect(
      parsePhonePeLine('Paid to Swiggy ₹450')
    ).toBeNull();
  });
});