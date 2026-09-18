import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Badge from '../components/Badge'
import BudgetProgress from '../components/charts/BudgetProgress'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { goalAPI } from '../utils/api'
import { useTransactions } from '../hooks/useTransactions'

const CATEGORY_OPTIONS = ['food', 'transport', 'shopping', 'entertainment', 'health', 'recharge', 'transfers', 'other']

function GoalsPage() {
  const { isAuthenticated } = useAuth()
  const { transactions, analytics } = useTransactions()
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

  const [savingsGoal, setSavingsGoal] = useState(0)
  const [currentSavings, setCurrentSavings] = useState(0)
  const [editingGoal, setEditingGoal] = useState(false)
  const [newGoal, setNewGoal] = useState(0)
  const [savingsGoalId, setSavingsGoalId] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Add Budget form state
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [newBudgetCategory, setNewBudgetCategory] = useState('')
  const [newBudgetLimit, setNewBudgetLimit] = useState('')
  const [savingBudget, setSavingBudget] = useState(false)

  // Fetch goals from backend
  useEffect(() => {
    async function fetchGoals() {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }
      try {
        const data = await goalAPI.getAll(currentMonth)
        if (data.goals && data.goals.length > 0) {
          const savings = data.goals.find((g) => g.type === 'monthly_savings')
          if (savings) {
            setSavingsGoal(savings.targetAmount)
            setCurrentSavings(savings.currentAmount)
            setNewGoal(savings.targetAmount)
            setSavingsGoalId(savings._id)
          }
          const categoryGoals = data.goals.filter((g) => g.type === 'category_budget')
          if (categoryGoals.length > 0) {
            setBudgets(
              categoryGoals.map((g) => ({
                category: g.category,
                spent: g.currentAmount,
                limit: g.targetAmount,
                _id: g._id,
              }))
            )
          }
        }
      } catch (err) {
        console.warn('Failed to fetch goals:', err.message)
        setError('Could not load goals from server.')
      }
      setLoading(false)
    }
    fetchGoals()
  }, [isAuthenticated, currentMonth])

  // Compute real spent per category from transactions
  const categorySpending = useMemo(() => {
    if (!transactions || transactions.length === 0) return {}
    const map = {}
    transactions.forEach(t => {
      const type = (t.type || '').toUpperCase()
      if (type !== 'DEBIT') return
      const cat = (t.category || 'other').toLowerCase()
      map[cat] = (map[cat] || 0) + (t.amount || 0)
    })
    return map
  }, [transactions])

  // Merge real spending into budget rows
  const enrichedBudgets = useMemo(() => {
    return budgets.map(b => ({
      ...b,
      spent: categorySpending[b.category?.toLowerCase()] ?? b.spent,
    }))
  }, [budgets, categorySpending])

  // Save / update savings goal
  const handleSaveGoal = async () => {
    if (newGoal <= 0) return
    setSavingsGoal(newGoal)
    setEditingGoal(false)
    if (!isAuthenticated) return
    try {
      if (savingsGoalId) {
        await goalAPI.update(savingsGoalId, { targetAmount: newGoal })
      } else {
        const data = await goalAPI.create({ type: 'monthly_savings', targetAmount: newGoal, month: currentMonth })
        setSavingsGoalId(data.goal._id)
      }
    } catch (err) {
      console.warn('Failed to save goal:', err.message)
    }
  }

  // Add a new category budget via API
  const handleAddBudget = async () => {
    if (!newBudgetCategory || !newBudgetLimit || Number(newBudgetLimit) <= 0) return
    setSavingBudget(true)
    try {
      const data = await goalAPI.create({
        type: 'category_budget',
        category: newBudgetCategory,
        targetAmount: Number(newBudgetLimit),
        month: currentMonth,
      })
      const goal = data.goal
      setBudgets(prev => [
        ...prev,
        {
          category: goal.category,
          spent: goal.currentAmount,
          limit: goal.targetAmount,
          _id: goal._id,
        },
      ])
      setShowAddBudget(false)
      setNewBudgetCategory('')
      setNewBudgetLimit('')
    } catch (err) {
      console.warn('Failed to add budget:', err.message)
      setError('Could not create budget. ' + (err.message || ''))
    }
    setSavingBudget(false)
  }

  // Delete a budget goal
  const handleDeleteBudget = async (id) => {
    try {
      await goalAPI.delete(id)
      setBudgets(prev => prev.filter(b => b._id !== id))
    } catch (err) {
      console.warn('Failed to delete budget:', err.message)
    }
  }
  
  const savingsPercentage = savingsGoal > 0 ? Math.min(100, Math.round((currentSavings / savingsGoal) * 100)) : 0

  // Dynamic achievements based on real data
  const achievements = useMemo(() => {
    const txCount = transactions?.length || 0
    const totalCredit = analytics?.totals?.totalCredit || 0
    const totalSpent = analytics?.totals?.totalSpent || 0
    const savingsRate = totalCredit > 0 ? ((totalCredit - totalSpent) / totalCredit) * 100 : 0
    const allWithinBudget = enrichedBudgets.length > 0 && enrichedBudgets.every(b => b.spent <= b.limit)

    return [
      {
        emoji: '🎉',
        title: 'First Upload',
        description: 'Uploaded your first statement',
        unlocked: txCount > 0,
      },
      {
        emoji: '📊',
        title: '100+ Transactions',
        description: 'Tracked over 100 transactions',
        unlocked: txCount >= 100,
      },
      {
        emoji: '🎯',
        title: 'Budget Master',
        description: 'Stayed within all category budgets',
        unlocked: allWithinBudget,
      },
      {
        emoji: '💎',
        title: 'Super Saver',
        description: 'Saved 30% or more of income',
        unlocked: savingsRate >= 30,
      },
    ]
  }, [transactions, analytics, enrichedBudgets])

  // Categories already used — filter from Add Budget dropdown
  const usedCategories = budgets.map(b => b.category?.toLowerCase())
  const availableCategories = CATEGORY_OPTIONS.filter(c => !usedCategories.includes(c))
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showTabs />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-500"></div>
          <p className="text-sm text-gray-400">Loading your goals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <Navbar showTabs />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-6 page-enter">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Savings Goals & Budgets</h1>
          <p className="text-neutral">Track your savings progress and category budgets</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button className="text-red-500 hover:text-red-700 font-medium" onClick={() => setError(null)}>✕</button>
          </div>
        )}
        
        {/* Monthly Savings Goal */}
        <Card className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Savings Goal</h3>
            </div>
            <button
              onClick={() => setEditingGoal(!editingGoal)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all"
            >
              ✏️ Edit
            </button>
          </div>
          
          {editingGoal && (
            <div className="mb-4 flex gap-3">
              <input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(Number(e.target.value))}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono w-44 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                placeholder="Enter goal amount"
              />
              <button
                onClick={handleSaveGoal}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-sm transition-all"
              >
                Save
              </button>
            </div>
          )}

          {savingsGoal > 0 ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-neutral text-sm">Current: <span className="font-mono font-bold text-primary-dark">₹{currentSavings.toLocaleString('en-IN')}</span></span>
                <span className="text-neutral text-sm">Target: <span className="font-mono font-bold text-primary-dark">₹{savingsGoal.toLocaleString('en-IN')}</span></span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-2xl overflow-hidden" style={{ height: '28px' }}>
                <div
                  className="h-full rounded-2xl flex items-center px-3 transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(savingsPercentage, 8)}%`,
                    background: savingsPercentage >= 100
                      ? 'linear-gradient(90deg, #10B981, #059669)'
                      : 'linear-gradient(90deg, #3B82F6, #6366F1)',
                  }}
                >
                  <span className="text-white text-xs font-bold">{savingsPercentage}%</span>
                </div>
              </div>
              
              <p className="text-sm text-neutral mt-3">
                {savingsPercentage >= 100
                  ? '🎉 Goal achieved! Amazing work!'
                  : savingsPercentage >= 50
                    ? `💪 Halfway there! Need ₹${(savingsGoal - currentSavings).toLocaleString('en-IN')} more.`
                    : `📈 Keep going! Save ₹${(savingsGoal - currentSavings).toLocaleString('en-IN')} more this month.`}
              </p>
            </>
          ) : (
            <p className="text-neutral text-sm py-4 text-center">
              No savings goal set yet. Click <strong>Edit Goal</strong> to create one.
            </p>
          )}
        </Card>
        
        {/* Category Budgets */}
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Category Budgets</h3>
            </div>
            {availableCategories.length > 0 && (
              <button
                onClick={() => setShowAddBudget(!showAddBudget)}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl shadow-sm transition-all"
              >
                + Add Budget
              </button>
            )}
          </div>

          {/* Add Budget Form */}
          {showAddBudget && (
            <div className="mb-5 p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                  <select
                    value={newBudgetCategory}
                    onChange={(e) => setNewBudgetCategory(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-44 bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all"
                  >
                    <option value="">Select category</option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Monthly Limit (₹)</label>
                  <input
                    type="number"
                    value={newBudgetLimit}
                    onChange={(e) => setNewBudgetLimit(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono w-32 bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all"
                    placeholder="5000"
                  />
                </div>
                <button
                  onClick={handleAddBudget}
                  disabled={savingBudget || !newBudgetCategory || !newBudgetLimit}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {savingBudget ? 'Saving...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowAddBudget(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {enrichedBudgets.length > 0 ? (
            <>
              <BudgetProgress budgets={enrichedBudgets} />
              {/* Delete buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {enrichedBudgets.map(b => b._id && (
                  <button
                    key={b._id}
                    onClick={() => handleDeleteBudget(b._id)}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline"
                  >
                    Remove {b.category}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-neutral text-center py-6 text-sm">
              No category budgets set. Click <strong>+ Add Budget</strong> to create one.
            </p>
          )}
        </Card>
        
        {/* Achievements */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-5 rounded-xl border-2 transition-all duration-300 group hover:shadow-md ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300'
                    : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{achievement.emoji}</div>
                <p className="font-semibold text-gray-800 text-sm">{achievement.title}</p>
                <p className="text-xs text-neutral mt-1 leading-relaxed">{achievement.description}</p>
                {achievement.unlocked && (
                  <span className="inline-flex items-center mt-3 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
                    ✓ Unlocked
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default GoalsPage
