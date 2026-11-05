const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const { importTransactions } = require('../utils/importTransactions');
const { parseUPIStatement } = require('../utils/parsers');

const receivePDF = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => cb(
    file.mimetype === 'application/pdf' ? null : new Error('Only PDF files are allowed.'),
    file.mimetype === 'application/pdf'
  ),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('pdf');

function upload(req, res, next) {
  receivePDF(req, res, (error) => {
    if (error) return res.status(400).json({ success: false,
      message: error.code === 'LIMIT_FILE_SIZE' ? 'PDF file exceeds the 5 MB limit.' : 'Invalid PDF upload. Use field name "pdf".',
    });
    next();
  });
}

async function uploadPDF(req, res) {
  try {
    if (!req.file) return res.status(400).json({ success: false,
      message: 'No PDF file uploaded. Use field name "pdf".',
    });
    const { buffer, originalname } = req.file;
    let rawText;
    let parser;
    try {
      parser = new PDFParse({ data: buffer });
      rawText = (await parser.getText()).text;
    } catch (_error) {
      return res.status(400).json({ success: false,
        message: 'Invalid or corrupted PDF file. Could not read contents.',
      });
    } finally {
      if (parser) await parser.destroy().catch(() => {});
    }
    if (!rawText || !rawText.trim()) return res.status(400).json({ success: false,
      message: 'Could not extract text from this PDF. It may be a scanned image or encrypted.',
    });
    const { provider, transactions } = parseUPIStatement(rawText);
    if (!transactions.length) return res.status(400).json({ success: false,
      message: `No transactions found in this PDF. Detected provider: ${provider}.`,
      rawTextLength: rawText.length,
    });
    let result;
    try {
      result = await importTransactions(transactions, req.user.id);
    } catch (_error) {
      return res.status(500).json({ success: false,
        message: 'Database error while saving transactions.',
      });
    }
    const { saved, duplicates, errors } = result;
    const counts = {
      count: saved.length,
      skipped: duplicates,
      total: transactions.length,
      transactions: saved,
    };
    if (errors.length) return res.status(saved.length || duplicates ? 207 : 500).json({
      success: false,
      message: `${saved.length} imported, ${duplicates} skipped; ${errors.length} failed.`,
      ...counts,
      errors,
    });
    if (!saved.length) return res.status(200).json({
      success: true,
      message: `No new transactions imported from "${originalname}". ${duplicates} already existed.`,
      ...counts,
    });
    return res.status(201).json({
      success: true,
      message: `${saved.length} transactions imported from "${originalname}"; ${duplicates} skipped.`,
      ...counts,
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Failed to process PDF.' });
  }
}

module.exports = { upload, uploadPDF };
