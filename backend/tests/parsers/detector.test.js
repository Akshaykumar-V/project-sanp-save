const { detectStatementProvider } = require('../../src/utils/parsers/detector');

describe('detectStatementProvider', () => {
  test('detects PhonePe', () => {
    expect(
      detectStatementProvider('PhonePe transaction statement')
    ).toBe('PHONEPE');
  });

  test('detects Google Pay', () => {
    expect(
      detectStatementProvider('Google Pay transaction statement')
    ).toBe('GOOGLE_PAY');
  });

  test('detects Paytm', () => {
    expect(
      detectStatementProvider('Paytm transaction statement')
    ).toBe('PAYTM');
  });

  test('detects BHIM', () => {
    expect(
      detectStatementProvider('BHIM transaction statement')
    ).toBe('BHIM');
  });

  test('detects Amazon Pay', () => {
    expect(
      detectStatementProvider('Amazon Pay transaction statement')
    ).toBe('AMAZON_PAY');
  });

  test('returns UNKNOWN for unsupported text', () => {
    expect(
      detectStatementProvider('This is not a UPI statement')
    ).toBe('UNKNOWN');
  });

  test('returns UNKNOWN for empty input', () => {
    expect(detectStatementProvider('')).toBe('UNKNOWN');
  });
});