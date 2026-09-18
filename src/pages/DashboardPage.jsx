import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import AlertItem from '../components/AlertItem'
import Badge from '../components/Badge'
import SpendingPieChart from '../components/charts/SpendingPieChart'
import DailyBarChart from '../components/charts/DailyBarChart'
import { useTransactions } from '../hooks/useTransactions'
import { aiAPI } from '../utils/api'

function DashboardPage() {
  const { analytics, meta, loading, error, transactions, dataSource, resetTransactions } = useTransactions()
  const navigate = useNavigate()

  const [aiTips, setAiTips] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  const handleGenerateAITips = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      const response = await aiAPI.generateTips()
      setAiTips(response.tips || [])
    } catch (err) {
      setAiError(err.message || 'Failed to generate tips')
    } finally {
      setAiLoading(false)
    }
  }

  const handleClearData = async () => {
    setClearing(true)
    try {
      await resetTransactions()
      setAiTips([])
      setShowClearConfirm(false)
      navigate('/upload')
    } catch (err) {
      console.warn('Clear failed:', err)
    } finally {
      setClearing(false)
    }
  }
  
  const formatCurrency = (amount) => {
    const abs = Math.abs(amount)
    return `${amount < 0 ? '-' : ''}₹${abs.toLocaleString('en-IN')}`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 float">💰</div>
          <p className="text-neutral font-medium">Loading your data...</p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    )
  }

  // Empty state — no transactions at all
  if (!analytics || !transactions || transactions.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-6">
        <Navbar showTabs />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center page-enter">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-primary/5 flex items-center justify-center">
            <span className="text-5xl">📊</span>
          </div>
          <h2 className="text-h2 font-bold text-gray-900 mb-3">No Transactions Yet</h2>
          <p className="text-neutral mb-8 max-w-sm mx-auto">Upload a PhonePe PDF statement to see your spending dashboard with AI-powered insights.</p>
          <button
            onClick={() => navigate('/upload')}
            className="bg-primary text-white font-semibold px-8 py-3.5 rounded-full hover:shadow-btn-hover hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            📁 Upload PDF
          </button>
        </div>
      </div>
    )
  }
  
  const { totals, categoryBreakdown, dailySpending, financialScore, wasteAlerts, savingTips } = analytics
  
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <Navbar showTabs />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-6 page-enter">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-neutral text-sm">📅 {meta?.month || 'Current Period'}</span>
              <Badge variant="info">{financialScore.grade} {financialScore.emoji}</Badge>
              {dataSource === 'sample' && (
                <Badge variant="warning">Demo Data</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
            >
              🗑️ Clear Data
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-sm transition-all"
            >
              📁 Upload New
            </button>
          </div>
        </div>

        {/* Clear Data Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 slide-up">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
                  <span className="text-3xl">🗑️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Clear All Data?</h3>
                <p className="text-sm text-gray-500 mb-6">This will permanently delete all your transactions. You can upload a new PDF after clearing.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearData}
                    disabled={clearing}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all disabled:opacity-50"
                  >
                    {clearing ? '⏳ Clearing...' : '🗑️ Yes, Clear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon="💸"
            label="Spent"
            amount={formatCurrency(totals.totalSpent)}
            change={`${transactions.length} transactions`}
            changeType="neutral"
          />
          <StatCard
            icon="💰"
            label="Received"
            amount={formatCurrency(totals.totalReceived)}
            change={totals.totalReceived > 0 ? 'Income tracked' : 'No income data'}
            changeType="neutral"
          />
          <StatCard
            icon="💵"
            label="Balance"
            amount={formatCurrency(totals.netBalance)}
            change={totals.netBalance >= 0 ? 'Positive balance' : 'Deficit — review spending'}
            changeType={totals.netBalance >= 0 ? 'positive' : 'negative'}
          />
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm">🍩</div>
              <h3 className="text-h4 font-semibold text-gray-900">Spending by Category</h3>
            </div>
            {categoryBreakdown.length > 0 ? (
              <SpendingPieChart data={categoryBreakdown} />
            ) : (
              <p className="text-neutral text-center py-8">No spending data to show</p>
            )}
          </Card>
          
          {/* Waste Alerts — computed from real data */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-sm">⚠️</div>
              <h3 className="text-h4 font-semibold text-gray-900">Waste Alerts</h3>
            </div>
            {wasteAlerts && wasteAlerts.length > 0 ? (
              <div className="space-y-3">
                {wasteAlerts.map((alert, index) => (
                  <AlertItem
                    key={index}
                    merchant={alert.merchant}
                    details={alert.details}
                    insight={alert.insight}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-neutral">No waste patterns detected — great spending habits!</p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Daily Spending Chart */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-sm">📈</div>
            <h3 className="text-h4 font-semibold text-gray-900">Daily Spending — {meta?.month || 'Current Period'}</h3>
          </div>
          <p className="text-neutral text-sm mb-4 ml-10">Your spending pattern across the month</p>
          {dailySpending.length > 0 ? (
            <>
              <DailyBarChart data={dailySpending} />
              {(() => {
                const maxDay = dailySpending.reduce((max, d) => d.amount > max.amount ? d : max, dailySpending[0])
                return maxDay.amount > 0 ? (
                  <p className="text-sm text-neutral mt-3">
                    💡 Highest spending was on day {maxDay.day} ({formatCurrency(maxDay.amount)}). Plan ahead for high-spend days!
                  </p>
                ) : null
              })()}
            </>
          ) : (
            <p className="text-neutral text-center py-8">No daily spending data</p>
          )}
        </Card>
        
        {/* Smart Tips — generated from real data */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-sm">✨</div>
            <h3 className="text-h4 font-semibold text-gray-900">Smart Money Tips</h3>
          </div>
          {savingTips && savingTips.length > 0 ? (
            <div className="space-y-3 mb-4">
              {savingTips.map((tip, index) => (
                <div key={index} className="flex gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-green-600 font-bold text-lg">{index + 1}.</span>
                  <div>
                    <p className="text-gray-800">{tip.tip}</p>
                    <p className="text-success font-bold mt-1">Save {tip.saving}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral text-center py-4">Upload more transactions to get personalized tips.</p>
          )}
        </Card>

        {/* AI Financial Tips — powered by Groq */}
        <Card className="mt-6" glow>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg shadow-sm">
                🤖
              </div>
              <div>
                <h3 className="text-h4 font-semibold text-gray-900">AI Financial Tips</h3>
                <p className="text-xs text-neutral">Powered by Groq AI</p>
              </div>
            </div>
            <button
              onClick={handleGenerateAITips}
              disabled={aiLoading || transactions.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
            >
              {aiLoading ? '⏳ Generating...' : '✨ Generate Tips'}
            </button>
          </div>

          {aiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
              <span>⚠️</span> {aiError}
            </div>
          )}

          {transactions.length === 0 && !aiLoading && (
            <div className="text-center py-8 text-neutral">
              <p>Upload transactions to get AI-powered financial tips!</p>
            </div>
          )}

          {aiLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="shimmer rounded-xl h-20" />
              ))}
              <p className="text-neutral text-sm text-center mt-2">🧠 AI is analyzing your spending...</p>
            </div>
          )}

          {!aiLoading && aiTips.length > 0 && (
            <div className="space-y-3">
              {aiTips.map((tip, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4 transition-all duration-200 hover:shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">{index + 1}</span>
                    {tip.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-2 ml-8">{tip.description}</p>
                  {tip.potentialSavings && tip.potentialSavings !== '₹0' && (
                    <span className="ml-8 inline-flex items-center gap-1 text-green-600 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full">
                      💰 Could save: {tip.potentialSavings}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!aiLoading && aiTips.length === 0 && transactions.length > 0 && (
            <div className="text-center py-10 text-neutral">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
              <p>Click <strong>"Generate Tips"</strong> to get AI-powered financial advice!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
