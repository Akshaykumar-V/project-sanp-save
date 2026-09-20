const { categorize } = require('../utils/categorize');

const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const Transaction = require('../models/Transaction');
const { categorize } = require('../utils/categorize');

// ─── Multer configuration ────────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('pdf');

// ─── PhonePe text parser ─────────────────────────────────────────
function parsePhonePeTransactions(text) {
  const transactions = [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Common PhonePe date patterns:
  // "Feb 20, 2026"
  // "20 Feb 2026"
  // "2026-02-20"
  // "20/02/2026"
  const datePatterns = [
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/i,
    /\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/i,
    /\b\d{4}-\d{2}-\d{2}\b/,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
  ];

  let currentDate = null;

  for (const line of lines) {
    // ─── Extract date ─────────────────────────────────────────────
    for (const pattern of datePatterns) {
      const dateMatch = line.match(pattern);

      if (dateMatch) {
        const parsed = new Date(dateMatch[0].replace(',', ''));

        if (!isNaN(parsed.getTime())) {
          currentDate = parsed;
        }

        break;
      }
    }

    // ─── Extract amount(s) ───────────────────────────────────────
    const amounts = [];
    let match;

    const amountRe =
      /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/gi;

    while ((match = amountRe.exec(line)) !== null) {
      const value = parseFloat(match[1].replace(/,/g, ''));

      if (value > 0) {
        amounts.push(value);
      }
    }

    if (amounts.length > 0 && currentDate) {
      // ─── Determine debit / credit ──────────────────────────────
      const lowerLine = line.toLowerCase();

      const isCredit =
        lowerLine.includes('credit') ||
        lowerLine.includes('received') ||
        lowerLine.includes('cashback') ||
        lowerLine.includes('refund');

      const type = isCredit ? 'CREDIT' : 'DEBIT';

      // ─── Extract merchant ──────────────────────────────────────
      let merchant = line
        .replace(
          /(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d{1,2})?/gi,
          ''
        )
        .replace(
          /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi,
          ''
        )
        .replace(
          /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/gi,
          ''
        )
        .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '')
        .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '')
        .replace(
          /\b(debit|credit|paid to|received from|sent to|upi|utr|ref)\b/gi,
          ''
        )
        .replace(/[|•\-–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!merchant) {
        merchant = 'Unknown Merchant';
      }

      // Keep merchant name reasonably short
      if (merchant.length > 40) {
        merchant = merchant.substring(0, 40).trim();
      }

      // ─── Use shared transaction categorizer ────────────────────
      const category = categorize(merchant);

      transactions.push({
        date: currentDate,
        merchant,
        amount: amounts[0],
        type,
        category,
        rawText: line,
      });
    }
  }

  return transactions;
}

// ─── POST /api/upload — upload & parse PhonePe PDF ───────────────
async function uploadPDF(req, res) {
  try {
    // 1. Check file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded. Use field name "pdf".',
      });
    }

    const { buffer, originalname } = req.file;

    // 2. Extract text from PDF
    let rawText;

    try {
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();

      rawText = pdfData.text;

      await parser.destroy();
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or corrupted PDF file. Could not read contents.',
      });
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Could not extract text from this PDF. It may be a scanned image or encrypted.',
      });
    }

    // 3. Parse transactions from extracted text
    const parsed = parsePhonePeTransactions(rawText);

    if (!parsed.length) {
      return res.status(400).json({
        success: false,
        message:
          'No transactions found in this PDF. Ensure it is a PhonePe UPI statement.',
        rawTextLength: rawText.length,
      });
    }

    // 4. Attach user id
    const userId = req.user.id;

    const docs = parsed.map((t) => ({
      ...t,
      user: userId,
    }));

    // 5. Bulk insert into database
    let saved;

    try {
      saved = await Transaction.insertMany(docs, {
        ordered: false,
      });
    } catch (dbErr) {
      // Partial insert — some transactions may have succeeded
      if (dbErr.insertedDocs && dbErr.insertedDocs.length > 0) {
        return res.status(207).json({
          success: true,
          message: `Partially imported: ${dbErr.insertedDocs.length} of ${docs.length} transactions saved. Some failed validation.`,
          count: dbErr.insertedDocs.length,
          transactions: dbErr.insertedDocs,
          errors: dbErr.writeErrors?.map((e) => e.errmsg),
        });
      }

      console.error('uploadPDF DB error:', dbErr.message);

      return res.status(500).json({
        success: false,
        message: 'Database error while saving transactions.',
      });
    }

    // 6. Success response
    return res.status(201).json({
      success: true,
      count: saved.length,
      message: `${saved.length} transactions imported from "${originalname}".`,
      transactions: saved,
    });
  } catch (err) {
    console.error('uploadPDF error:', err.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to process PDF.',
    });
  }
}

module.exports = {
  upload,
  uploadPDF,
};