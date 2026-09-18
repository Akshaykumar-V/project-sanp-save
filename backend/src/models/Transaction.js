const mongoose = require('mongoose');

const CATEGORIES = [
  'food',
  'transport',
  'shopping',
  'entertainment',
  'health',
  'recharge',
  'transfers',
  'other',
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
    },
    merchant: {
      type: String,
      required: [true, 'Merchant name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      enum: {
        values: ['DEBIT', 'CREDIT'],
        message: '{VALUE} is not a valid transaction type',
      },
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      required: [true, 'Category is required'],
    },
    rawText: {
      type: String,
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
    utrNumber: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for fast per-user date-range queries
transactionSchema.index({ user: 1, date: -1 });

// Static: fetch transactions for a user within a date range
transactionSchema.statics.getByDateRange = function (userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 });
};

// Static: aggregate category totals for a user (optionally within a date range)
transactionSchema.statics.getCategoryTotals = function (userId, startDate, endDate) {
  const match = { user: new mongoose.Types.ObjectId(userId), type: 'DEBIT' };
  if (startDate && endDate) {
    match.date = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);
