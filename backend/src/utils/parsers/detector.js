function detectStatementProvider(text) {
  if (!text || typeof text !== 'string') {
    return 'UNKNOWN';
  }

  const normalizedText = text.toLowerCase();

  if (
    normalizedText.includes('phonepe') ||
    normalizedText.includes('phone pe')
  ) {
    return 'PHONEPE';
  }

  if (
    normalizedText.includes('google pay') ||
    normalizedText.includes('gpay')
  ) {
    return 'GOOGLE_PAY';
  }

  if (normalizedText.includes('paytm')) {
    return 'PAYTM';
  }

  if (normalizedText.includes('bhim')) {
    return 'BHIM';
  }

  if (
    normalizedText.includes('amazon pay') ||
    normalizedText.includes('amazonpay')
  ) {
    return 'AMAZON_PAY';
  }

  return 'UNKNOWN';
}

module.exports = { detectStatementProvider };