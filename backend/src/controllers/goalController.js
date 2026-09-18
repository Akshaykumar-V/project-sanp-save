const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// ── Helper: validate YYYY-MM format ────────────────────────────────
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function isValidMonth(month) {
  return MONTH_RE.test(month);
}

// ── Helper: calculate current progress for a goal ──────────────────
async function calculateProgress(goal, userId) {
  const [year, mon] = goal.month.split('-').map(Number);
  const startDate = new Date(year, mon - 1, 1);
  const endDate = new Date(year, mon, 0, 23, 59, 59, 999);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  if (goal.type === 'monthly_savings') {
    const [creditAgg, debitAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userObjectId, type: 'CREDIT', date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { user: userObjectId, type: 'DEBIT', date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);
    const totalReceived = creditAgg[0]?.total || 0;
    const totalSpent = debitAgg[0]?.total || 0;
    return Math.max(totalReceived - totalSpent, 0);
  }

  // category_budget → sum of DEBIT transactions in that category
  const [debitAgg] = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        type: 'DEBIT',
        category: goal.category,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return debitAgg?.total || 0;
}

// ── GET /api/goals ─────────────────────────────────────────────────
async function getGoals(req, res) {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    if (month && !isValidMonth(month)) {
      return res
        .status(400)
        .json({ success: false, message: 'month must be in YYYY-MM format.' });
    }

    const filter = { user: userId };
    if (month) filter.month = month;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });

    // Calculate live progress for every goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (g) => {
        const currentAmount = await calculateProgress(g, userId);
        const obj = g.toObject();
        obj.currentAmount = currentAmount;
        obj.progress = g.targetAmount === 0
          ? 100
          : Math.min(Math.round((currentAmount / g.targetAmount) * 100), 100);
        return obj;
      })
    );

    return res.status(200).json({
      success: true,
      count: goalsWithProgress.length,
      goals: goalsWithProgress,
    });
  } catch (err) {
    console.error('getGoals error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── POST /api/goals ────────────────────────────────────────────────
async function createGoal(req, res) {
  try {
    const userId = req.user.id;
    const { type, targetAmount, category, month } = req.body;

    // Required fields
    if (!type || targetAmount === undefined || !month) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide type, targetAmount, and month.' });
    }

    // Validate type enum
    if (!['monthly_savings', 'category_budget'].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: `${type} is not a valid goal type.` });
    }

    // Validate month format
    if (!isValidMonth(month)) {
      return res
        .status(400)
        .json({ success: false, message: 'month must be in YYYY-MM format.' });
    }

    // category_budget requires category
    if (type === 'category_budget' && !category) {
      return res
        .status(400)
        .json({ success: false, message: 'Category is required for category_budget goals.' });
    }

    // Check for duplicate goal
    const duplicate = await Goal.findOne({
      user: userId,
      type,
      month,
      ...(type === 'category_budget' ? { category } : {}),
    });
    if (duplicate) {
      return res
        .status(409)
        .json({ success: false, message: 'A goal with this type/month/category already exists.' });
    }

    const goal = await Goal.create({
      user: userId,
      type,
      targetAmount,
      category: type === 'category_budget' ? category : null,
      month,
    });

    return res.status(201).json({ success: true, goal });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error('createGoal error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/goals/:id ────────────────────────────────────────────
async function getGoal(req, res) {
  try {
    const userId = req.user.id;
    const goal = await Goal.findOne({ _id: req.params.id, user: userId });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    const currentAmount = await calculateProgress(goal, userId);
    const obj = goal.toObject();
    obj.currentAmount = currentAmount;
    obj.progress = goal.targetAmount === 0
      ? 100
      : Math.min(Math.round((currentAmount / goal.targetAmount) * 100), 100);

    return res.status(200).json({ success: true, goal: obj });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── PUT /api/goals/:id ────────────────────────────────────────────
async function updateGoal(req, res) {
  try {
    const userId = req.user.id;
    const goal = await Goal.findOne({ _id: req.params.id, user: userId });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    // Only targetAmount and status may be updated
    const allowed = ['targetAmount', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) goal[field] = req.body[field];
    });

    // Auto-achieve if currentAmount meets target
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'achieved';
    }

    await goal.save();

    return res.status(200).json({
      success: true,
      goal: { ...goal.toObject(), progress: goal.getProgress() },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/goals/:id ──────────────────────────────────────────
async function deleteGoal(req, res) {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }
    return res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getGoals, createGoal, getGoal, updateGoal, deleteGoal };
