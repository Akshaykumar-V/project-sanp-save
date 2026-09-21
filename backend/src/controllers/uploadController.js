const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const Transaction = require('../models/Transaction');
const { parseUPIStatement } = require('../utils/parsers');

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

   
   /// 3. Parse transactions from extracted text
const { provider, transactions } = parseUPIStatement(rawText);
const parsed = transactions;

if (!parsed.length) {
  return res.status(400).json({
    success: false,
    message:
      `No transactions found in this PDF. Detected provider: ${provider}.`,
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