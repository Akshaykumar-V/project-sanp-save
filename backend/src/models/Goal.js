const mongoose = require('mongoose');

const GOAL_TYPES = ['monthly_savings', 'category_budget'];
const GOAL_STATUSES = ['active', 'achieved', 'failed'];

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: GOAL_TYPES,
        message: '{VALUE} is not a valid goal type',
      },
      required: [true, 'Goal type is required'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0, 'Target amount cannot be negative'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    category: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          // category is required only for category_budget goals
          if (this.type === 'category_budget' && !v) return false;
          return true;
        },
        message: 'Category is required for category_budget goals',
      },
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
    status: {
      type: String,
      enum: {
        values: GOAL_STATUSES,
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
  },
  { timestamps: true }
);

// Compound index for fast per-user monthly lookups
goalSchema.index({ user: 1, month: 1 });

// Instance method: calculate progress as a percentage (capped at 100)
goalSchema.methods.getProgress = function () {
  if (this.targetAmount === 0) return 100;
  return Math.min(
    Math.round((this.currentAmount / this.targetAmount) * 100),
    100
  );
};

// Instance method: update current amount and auto-set status
goalSchema.methods.updateCurrentAmount = async function (amount) {
  this.currentAmount = amount;
  if (this.currentAmount >= this.targetAmount) {
    this.status = 'achieved';
  }
  return this.save();
};

// Static: get all goals for a user in a specific month
goalSchema.statics.getByMonth = function (userId, month) {
  return this.find({ user: userId, month }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Goal', goalSchema);
