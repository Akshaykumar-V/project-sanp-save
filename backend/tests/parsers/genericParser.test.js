const { parseGenericUPIText } = require('../../src/utils/parsers/genericParser');

describe('parseGenericUPIText', () => {
  test('parses a generic debit transaction', () => {
    const result = parseGenericUPIText(
      '14/09/2026 Paid to Amazon ₹999'
    );

    expect(result).toHaveLength(1);
    expect(result[0].merchant).toBe('Amazon');
    expect(result[0].amount).toBe(999);
    expect(result[0].type).toBe('DEBIT');
    expect(result[0].category).toBe('shopping');
  });

  test('parses a generic credit transaction', () => {
    const result = parseGenericUPIText(
      '15/09/2026 Received from Rahul ₹2,000'
    );

    expect(result).toHaveLength(1);
    expect(result[0].merchant).toBe('Rahul');
    expect(result[0].amount).toBe(2000);
    expect(result[0].type).toBe('CREDIT');
  });

  test('returns empty array for empty input', () => {
    expect(parseGenericUPIText('')).toEqual([]);
  });

  test('ignores lines without a date', () => {
    const result = parseGenericUPIText(
      'Paid to Amazon ₹999'
    );

    expect(result).toEqual([]);
  });

  test('rejects an invalid date', () => {
    const result = parseGenericUPIText(
      '31/02/2026 Paid to Amazon ₹999'
    );

    expect(result).toEqual([]);
  });
});