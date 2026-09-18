const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// Helper — check if a string is a valid Mongo ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── 1. GET /api/transactions ────────────────────────────────────
// List all transactions for the logged-in user with filters & pagination
async function getTransactions(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category, type, page = 1, limit = 50 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(parseInt(limit) || 50, 500));

    const filter = { user: userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (category) filter.category = category;
    if (type) filter.type = type.toUpperCase();

    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      transactions,
    });
  } catch (err) {
    console.error('getTransactions error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ─── 2. GET /api/transactions/summary ────────────────────────────
// Aggregated spending summary for the user
async function getTransactionSummary(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Category breakdown via model static
    const categories = await Transaction.getCategoryTotals(userId, start, end);

    // Overall totals
    const match = { user: new mongoose.Types.ObjectId(userId) };
    if (start || end) {
      match.date = {};
      if (start) match.date.$gte = start;
      if (end) match.date.$lte = end;
    }

    const [totals] = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpent: {
            $sum: { $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0] },
          },
          totalReceived: {
            $sum: { $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0] },
          },
        },
      },
    ]);

    const totalSpent = totals?.totalSpent || 0;
    const totalReceived = totals?.totalReceived || 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalSpent,
        totalReceived,
        netBalance: totalReceived - totalSpent,
        categories,
      },
    });
  } catch (err) {
    console.error('getTransactionSummary error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ─── 3. POST /api/transactions ───────────────────────────────────
// Create one or many transactions (bulk via { transactions: [...] })
async function createTransactions(req, res) {
  try {
    const userId = req.user.id;
    const { transactions } = req.body;

    // Accept { transactions: [...] } or a single object
    const items = Array.isArray(transactions) ? transactions : [req.body];

    if (!items.length) {
      return res.status(400).json({ success: false, message: 'No transactions provided.' });
    }

    // Validate required fields
    for (const t of items) {
      if (!t.date || !t.merchant || t.amount == null || !t.type) {
        return res.status(400).json({
          success: false,
          message: 'Each transaction requires: date, merchant, amount, type.',
        });
      }
    }

    // Attach user id to every item
    const docs = items.map((t) => ({
      date: t.date,
      merchant: t.merchant,
      amount: t.amount,
      type: t.type,
      category: t.category || 'other',
      rawText: t.rawText,
      transactionId: t.transactionId,
      utrNumber: t.utrNumber,
      user: userId,
    }));

    const saved = await Transaction.insertMany(docs, { ordered: false });

    return res.status(201).json({
      success: true,
      count: saved.length,
      transactions: saved,
    });
  } catch (err) {
    if (err.name === 'ValidationError' || err.writeErrors) {
      return res.status(400).json({
        success: false,
        message: 'Validation error. Check transaction fields.',
      });
    }
    console.error('createTransactions error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ─── 4. GET /api/transactions/:id ────────────────────────────────
// Get a single transaction (verify ownership)
async function getTransaction(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID.' });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    return res.status(200).json({ success: true, transaction });
  } catch (err) {
    console.error('getTransaction error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ─── 5. PUT /api/transactions/:id ────────────────────────────────
// Update transaction fields (verify ownership)
async function updateTransaction(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID.' });
    }

    // Only allow updating these fields
    const allowedFields = ['merchant', 'amount', 'category', 'date', 'type'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    return res.status(200).json({ success: true, transaction });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('updateTransaction error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ─── 6. DELETE /api/transactions/:id ─────────────────────────────
// Delete a single transaction (verify ownership)
async function deleteTransaction(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID.' });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    return res.status(200).json({ success: true, message: 'Transaction deleted.' });
  } catch (err) {
    console.error('deleteTransaction error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ─── 7. DELETE /api/transactions/all ─────────────────────────────
// Delete all transactions for the logged-in user
async function deleteAllTransactions(req, res) {
  try {
    const result = await Transaction.deleteMany({ user: req.user.id });

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} transaction(s) deleted.`,
    });
  } catch (err) {
    console.error('deleteAllTransactions error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = {
  getTransactions,
  getTransactionSummary,
  createTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
};
