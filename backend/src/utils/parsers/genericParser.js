const { categorize } = require('../categorize');

function parseGenericUPIText(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const transactions = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const dateMatch = line.match(
      /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/
    );

    if (!dateMatch) {
      continue;
    }

    const amountMatches = [
      ...line.matchAll(
        /(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)/gi
      ),
    ];

    if (!amountMatches.length) {
      continue;
    }

    const amount = Number(
      amountMatches[amountMatches.length - 1][1].replace(/,/g, '')
    );

    if (!Number.isFinite(amount) || amount <= 0 || amount >= 1000000) {
      continue;
    }

    const date = parseDate(dateMatch[0]);

    if (!date) {
      continue;
    }

    const lowerLine = line.toLowerCase();

    const type =
      /\b(credit|credited|received|refund|refunded)\b/.test(lowerLine)
        ? 'CREDIT'
        : 'DEBIT';

    const merchant = line
  .replace(dateMatch[0], '')
  .replace(amountMatches[amountMatches.length - 1][0], '')
  .replace(
    /\b(debit|debited|credit|credited|received|refund|refunded|paid|payment|sent|transferred|to|from)\b/gi,
    ''
  )
  .replace(/\s+/g, ' ')
  .trim();

    if (!merchant) {
      continue;
    }

    transactions.push({
      date,
      merchant: merchant.slice(0, 80),
      amount,
      type,
      category: categorize(merchant),
      rawText: line.slice(0, 200),
    });
  }

  return transactions;
}

function parseDate(value) {
  const parts = value.split(/[/-]/);

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

module.exports = { parseGenericUPIText };