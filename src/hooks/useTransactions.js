import { useState, useEffect, useCallback, useMemo } from 'react'
import { sampleTransactions } from '../data/sampleData'
import { saveTransactions, loadTransactions, saveMeta, loadMeta, clearAll } from '../utils/storage'
import { calculateTotals, getCategoryBreakdown, getDailySpending, getTopMerchants, getRepeatedExpenses, getTimePatterns, calculateFinancialScore, getWasteAlerts, generateSavingTips } from '../utils/analytics'
import { transactionAPI, getToken } from '../utils/api'

export function useTransactions() {
  const [transactions, setTransactions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [dataSource, setDataSource] = useState(null) // 'server' | 'local' | 'sample'

  const isLoggedIn = !!getToken()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    // If logged in, try backend first
    if (isLoggedIn) {
      try {
        const data = await transactionAPI.getAll({ limit: 500 })
        if (data.transactions && data.transactions.length > 0) {
          const normalized = data.transactions.map((t, i) => ({
            id: t._id || i + 1,
            date: t.date,
            merchant: t.merchant,
            amount: t.amount,
            type: t.type.toLowerCase(),
            category: t.category,
          }))
          setTransactions(normalized)
          setMeta({ filename: 'Server Data', uploadedAt: new Date().toISOString(), month: getCurrentMonth(normalized) })
          setDataSource('server')
          setLoading(false)
          return
        } else {
          // User has no transactions on server
          setTransactions([])
          setMeta({ filename: 'No Data', uploadedAt: new Date().toISOString(), month: getCurrentMonth() })
          setDataSource('server')
          setLoading(false)
          return
        }
      } catch (err) {
        setError(`Failed to load transactions: ${err.message}`)
      }
    }

    // Fallback: localStorage
    const stored = loadTransactions()
    const storedMeta = loadMeta()
    if (stored && stored.length > 0) {
      setTransactions(stored)
      setMeta(storedMeta)
      setDataSource('local')
    } else if (!isLoggedIn) {
      // Only show sample data for guests with no local data
      setTransactions(sampleTransactions)
      setMeta({ filename: 'Sample Data (Demo)', uploadedAt: new Date().toISOString(), month: 'February 2025' })
      setDataSource('sample')
    } else {
      setTransactions([])
      setMeta(null)
      setDataSource('server')
    }
    setLoading(false)
  }, [isLoggedIn])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const uploadTransactions = useCallback((newTransactions, filename) => {
    const newMeta = {
      filename,
      uploadedAt: new Date().toISOString(),
      month: getCurrentMonth(newTransactions),
    }
    setTransactions(newTransactions)
    setMeta(newMeta)
    setDataSource(isLoggedIn ? 'server' : 'local')
    if (!isLoggedIn) {
      saveTransactions(newTransactions)
      saveMeta(newMeta)
    }
  }, [isLoggedIn])

  const resetTransactions = useCallback(async () => {
    // Delete from server if logged in
    if (isLoggedIn) {
      try {
        await transactionAPI.deleteAll()
      } catch (err) {
        console.warn('Failed to delete server transactions:', err.message)
      }
    }
    clearAll()
    setTransactions([])
    setMeta(null)
    setDataSource(null)
  }, [isLoggedIn])

  const analytics = useMemo(() => {
    if (!transactions || transactions.length === 0) return null
    return {
      totals: calculateTotals(transactions),
      categoryBreakdown: getCategoryBreakdown(transactions),
      dailySpending: getDailySpending(transactions),
      topMerchants: getTopMerchants(transactions),
      repeatedExpenses: getRepeatedExpenses(transactions),
      timePatterns: getTimePatterns(transactions),
      financialScore: calculateFinancialScore(transactions),
      wasteAlerts: getWasteAlerts(transactions),
      savingTips: generateSavingTips(transactions),
    }
  }, [transactions])

  return {
    transactions,
    loading,
    error,
    meta,
    analytics,
    dataSource,
    uploadTransactions,
    resetTransactions,
    refetch: fetchData,
  }
}

function getCurrentMonth(transactions) {
  if (transactions && transactions.length > 0) {
    const dates = transactions.map(t => new Date(t.date)).filter(d => !isNaN(d))
    if (dates.length > 0) {
      const latest = new Date(Math.max(...dates))
      return latest.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    }
  }
  const d = new Date()
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}
