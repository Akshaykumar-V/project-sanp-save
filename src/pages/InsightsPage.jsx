import { useState } from 'react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import TimeHeatmap from '../components/charts/TimeHeatmap'
import { useTransactions } from '../hooks/useTransactions'

function InsightsPage() {
  const { analytics, meta, loading, error, transactions } = useTransactions()
  const [showMore, setShowMore] = useState(false)
  
  const formatCurrency = (amount) => `₹${Math.round(amount).toLocaleString('en-IN')}`
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🔍</div>
          <p className="text-gray-400 text-sm">Analyzing your spending patterns...</p>
        </div>
      </div>
    )
  }

  if (!analytics || !transactions || transactions.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-6">
        <Navbar showTabs />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center page-enter">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔍</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Data for Insights</h2>
          <p className="text-neutral">Upload a PDF statement first to see deep spending insights.</p>
        </div>
      </div>
    )
  }
  
  const { topMerchants, repeatedExpenses, timePatterns, categoryBreakdown, totals, savingTips, wasteAlerts } = analytics
  
  const displayedMerchants = showMore ? topMerchants : topMerchants.slice(0, 5)
  
  const totalWaste = repeatedExpenses.reduce((sum, e) => sum + e.total, 0)
  
  // Generate dynamic potential savings from real data
  const potentialSavings = []
  if (repeatedExpenses.length > 0) {
    repeatedExpenses.slice(0, 3).forEach(exp => {
      const saving = Math.round(exp.total * 0.5)
      potentialSavings.push({
        condition: `IF you reduce ${exp.merchant} visits by 50% (${exp.count} orders)`,
        saving,
      })
    })
  }
  if (categoryBreakdown.length > 0) {
    const topCat = categoryBreakdown[0]
    potentialSavings.push({
      condition: `IF you cut ${topCat.name} spending by 20%`,
      saving: Math.round(topCat.value * 0.2),
    })
  }
  const totalSavings = potentialSavings.reduce((sum, s) => sum + s.saving, 0)
  
  // Dynamic insight text
  const topCategory = categoryBreakdown[0]
  const insightText = topCategory
    ? `💡 ${topCategory.name} is your highest spending category at ${topCategory.percentage}% of total expenses!`
    : null
  
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <Navbar showTabs />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-6 page-enter">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Deep Insights
          </h1>
          <p className="text-neutral">Detailed analysis of your spending — {meta?.month || 'Current Period'}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
          </div>
        )}
        
        {/* Top Merchants Table */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <span className="text-xl">🏪</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Top 10 Merchants</h3>
          </div>
          {topMerchants.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">#</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Merchant</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Total</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Count</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Avg/txn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedMerchants.map((merchant, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                        <td className="py-3 px-4 text-gray-400 font-medium">{index + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{merchant.merchant}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900">{formatCurrency(merchant.total)}</td>
                        <td className="py-3 px-4 text-right"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">{merchant.count}×</span></td>
                        <td className="py-3 px-4 text-right font-mono text-gray-500">{formatCurrency(merchant.avg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {topMerchants.length > 5 && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="mt-3 text-primary text-sm font-medium hover:underline"
                >
                  {showMore ? 'Show less ↑' : `Show more (${topMerchants.length - 5} more) ↓`}
                </button>
              )}
            </>
          ) : (
            <p className="text-neutral text-center py-4">No merchant data available</p>
          )}
        </Card>
        
        {/* Category Breakdown + Repeated Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Breakdown */}
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
            </div>
            {categoryBreakdown.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Category</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Amount</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryBreakdown.map((cat, index) => (
                        <tr key={index} className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-700 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full inline-block ring-2 ring-white shadow-sm" style={{ backgroundColor: cat.color }}></span>
                            {cat.name}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm font-medium">{formatCurrency(cat.value)}</td>
                          <td className="py-3 px-4 text-right"><span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">{cat.percentage}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {insightText && (
                  <p className="mt-4 text-sm text-orange-700 bg-orange-50 px-4 py-3 rounded-xl border border-orange-100">
                    {insightText}
                  </p>
                )}
              </>
            ) : (
              <p className="text-neutral text-center py-4">No spending data</p>
            )}
          </Card>
          
          {/* Repeated Expenses */}
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <span className="text-xl">🔁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Repeated Small Expenses</h3>
            </div>
            {repeatedExpenses.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Merchant</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Count</th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wide">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repeatedExpenses.map((expense, index) => (
                        <tr key={index} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-700">{expense.merchant}</td>
                          <td className="py-3 px-4 text-right"><span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-medium">{expense.count}×</span></td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-red-600">{formatCurrency(expense.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm text-orange-700 bg-orange-50 px-4 py-3 rounded-xl border border-orange-100">
                  💡 Total repeated expenses: {formatCurrency(totalWaste)}/month
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-neutral text-sm">No repeated expense patterns detected — well done!</p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Time Heatmap */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <span className="text-xl">⏰</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Spending Time Patterns</h3>
              <p className="text-neutral text-sm">When do you spend the most?</p>
            </div>
          </div>
          <div className="mt-4">
            <TimeHeatmap patterns={timePatterns} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="text-sm text-indigo-700 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100">
              💡 This heatmap shows spending by day & time
            </div>
            {totals.totalSpent > 0 && (
              <div className="text-sm text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
                💳 Average daily: {formatCurrency(Math.round(totals.totalSpent / 30))}
              </div>
            )}
          </div>
        </Card>
        
        {/* Potential Savings */}
        {potentialSavings.length > 0 && (
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Potential Savings</h3>
            </div>
            <div className="space-y-3 mb-5">
              {potentialSavings.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-green-50/70 rounded-xl border border-green-100 hover:bg-green-50 transition-colors">
                  <p className="text-gray-700 text-sm">{item.condition}</p>
                  <p className="text-green-700 font-bold font-mono ml-4 flex-shrink-0 bg-green-100 px-3 py-1 rounded-full text-sm">{formatCurrency(item.saving)}/mo</p>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-5 text-center">
              <p className="text-white font-bold text-lg">
                {formatCurrency(totalSavings)}/month = {formatCurrency(totalSavings * 12)}/year 🎉
              </p>
              <p className="text-green-100 text-sm mt-1">You could save this much with small changes!</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default InsightsPage
