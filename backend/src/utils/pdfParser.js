const { categorize } = require('./categorize');

// Parse raw text extracted from a PhonePe PDF statement
function parsePhonePeText(text) {
  const transactions = [];
  const lines = text.split('\n');

  lines.forEach((line) => {
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
    const amountPattern = /₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g;

    const dateMatch = line.match(datePattern);
    const amounts = [...line.matchAll(amountPattern)];

    if (dateMatch && amounts.length > 0) {
      const dateStr = dateMatch[1];
      const amount = parseFloat(amounts[0][1].replace(/,/g, ''));
      const isCredit =
        line.toLowerCase().includes('credit') ||
        line.toLowerCase().includes('received');

      const merchant = extractMerchant(line) || 'Unknown Merchant';

      if (amount > 0 && amount < 1000000) {
        transactions.push({
          date: formatDate(dateStr),
          merchant,
          amount,
          type: isCredit ? 'CREDIT' : 'DEBIT',
          category: categorize(merchant),
          rawText: line.trim().slice(0, 200),
        });
      }
    }
  });

  return transactions;
}

function extractMerchant(line) {
  const cleaned = line
    .replace(/₹?\s*\d+(?:,\d+)*(?:\.\d{2})?/g, '')
    .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.slice(0, 50) || null;
}

function formatDate(dateStr) {
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
    return new Date(`${year}-${month}-${day}`);
  }
  return new Date();
}

// Extract text from PDF buffer using pdfjs-dist
async function extractTextFromPDF(buffer) {
  // pdfjs-dist v4+ is ESM-only, use dynamic import
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const uint8 = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument({ data: uint8, useSystemFonts: true }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

module.exports = { extractTextFromPDF, parsePhonePeText };
