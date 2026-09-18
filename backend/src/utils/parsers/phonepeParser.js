const { normalizeTransaction } = require('./normalizer');
const { categorize } = require('../categorize');

const DATE_PATTERN = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;

const AMOUNT_PATTERN =
  /₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g;

function parsePhonePe(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => parsePhonePeLine(line))
    .filter(Boolean);
}

function parsePhonePeLine(line) {
  const dateMatch = line.match(DATE_PATTERN);
  const amounts = [...line.matchAll(AMOUNT_PATTERN)];

  if (!dateMatch || amounts.length === 0) {
    return null;
  }

  const date = parseDate(dateMatch[1]);

  if (!date) {
    return null;
  }

  const lowerLine = line.toLowerCase();

  const amount = Number(
    amounts[amounts.length - 1][1].replace(/,/g, '')
  );

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const merchant = line
    .replace(DATE_PATTERN, '')
    .replace(AMOUNT_PATTERN, '')
  .replace(
  /\b(debit|debited|credit|credited|received|refund|refunded|paid|payment|sent|transferred|to|from)\b/gi,
  ''
)
    .replace(/\s+/g, ' ')
    .trim();

  if (!merchant) {
    return null;
  }

  return normalizeTransaction({
    date,
    merchant: merchant.slice(0, 80),
    amount,
    type:
      /\b(credit|credited|received|refund|refunded)\b/i.test(lowerLine)
        ? 'CREDIT'
        : 'DEBIT',
    category: categorize(merchant),
    rawText: line,
  });
}

function parseDate(value) {
  const parts = value.split(/[\/-]/);

  if (parts.length !== 3) {
    return null;
  }

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  let year = Number(parts[2]);

  if (year < 100) {
    year += 2000;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

module.exports = {
  parsePhonePe,
  parsePhonePeLine,
};