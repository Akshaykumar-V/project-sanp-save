const { parseUPIStatement } = require('../../src/utils/parsers');

describe('parseUPIStatement', () => {
  test('uses the PhonePe parser for PhonePe statements', () => {
    const result = parseUPIStatement(
      'PhonePe\n12/09/2026 Paid to Swiggy ₹450'
    );

    expect(result.provider).toBe('PHONEPE');
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].merchant).toBe('Swiggy');
    expect(result.transactions[0].amount).toBe(450);
  });

  test('uses generic parsing for Google Pay statements', () => {
    const result = parseUPIStatement(
      'Google Pay\n14/09/2026 Paid to Amazon ₹999'
    );

    expect(result.provider).toBe('GOOGLE_PAY');
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].merchant).toBe('Amazon');
    expect(result.transactions[0].amount).toBe(999);
  });

  test('returns UNKNOWN for unsupported statements', () => {
    const result = parseUPIStatement(
      'Some random statement without provider'
    );

    expect(result.provider).toBe('UNKNOWN');
    expect(result.transactions).toEqual([]);
  });

  test('handles empty input', () => {
    const result = parseUPIStatement('');

    expect(result.provider).toBe('UNKNOWN');
    expect(result.transactions).toEqual([]);
  });
});