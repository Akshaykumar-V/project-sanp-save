  import { CATEGORY_COLORS } from '../data/sampleData'

export function calculateTotals(transactions) {
  if (!transactions || transactions.length === 0) {
    return { totalSpent: 0, totalReceived: 0, netBalance: 0, savingsRate: 0 }
  }
  const debits = transactions.filter(t => t.type === 'debit' || t.type === 'DEBIT')
  const credits = transactions.filter(t => t.type === 'credit' || t.type === 'CREDIT')
  
  const totalSpent = debits.reduce((sum, t) => sum + t.amount, 0)
  const totalReceived = credits.reduce((sum, t) => sum + t.amount, 0)
  const netBalance = totalReceived - totalSpent
  const savingsRate = totalReceived > 0 ? (netBalance / totalReceived) * 100 : 0
  
  return { totalSpent, totalReceived, netBalance, savingsRate }
}

export function getCategoryBreakdown(transactions) {
  if (!transactions || transactions.length === 0) return []
  const debits = transactions.filter(t => t.type === 'debit' || t.type === 'DEBIT')
  const categoryMap = {}
  
  debits.forEach(t => {
    const cat = t.category || 'Other'
    categoryMap[cat] = (categoryMap[cat] || 0) + t.amount
  })
  
  const total = Object.values(categoryMap).reduce((sum, v) => sum + v, 0)
  
  return Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    color: CATEGORY_COLORS[name] || '#B2BEC3',
  })).sort((a, b) => b.value - a.value)
}

export function getDailySpending(transactions) {
  if (!transactions || transactions.length === 0) return []
  const debits = transactions.filter(t => t.type === 'debit' || t.type === 'DEBIT')
  const dailyMap = {}
  
  // Find the actual date range from data
  let minDate = null
  let maxDate = null
  debits.forEach(t => {
    const d = new Date(t.date)
    if (!minDate || d < minDate) minDate = d
    if (!maxDate || d > maxDate) maxDate = d
  })
  
  if (!minDate) return []
  
  // Get days in the month of the most recent transaction
  const year = maxDate.getFullYear()
  const month = maxDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  debits.forEach(t => {
    const day = new Date(t.date).getDate()
    dailyMap[day] = (dailyMap[day] || 0) + t.amount
  })
  
  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    amount: dailyMap[i + 1] || 0,
  }))
}

export function getTopMerchants(transactions) {
  if (!transactions || transactions.length === 0) return []
  const debits = transactions.filter(t => t.type === 'debit' || t.type === 'DEBIT')
  const merchantMap = {}
  
  debits.forEach(t => {
    if (!merchantMap[t.merchant]) {
      merchantMap[t.merchant] = { total: 0, count: 0 }
    }
    merchantMap[t.merchant].total += t.amount
    merchantMap[t.merchant].count += 1
  })
  
  return Object.entries(merchantMap)
    .map(([merchant, data]) => ({
      merchant,
      total: data.total,
      count: data.count,
      avg: Math.round(data.total / data.count),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
}

export function getRepeatedExpenses(transactions) {
  if (!transactions || transactions.length === 0) return []
  const debits = transactions.filter(t => t.type === 'debit' || t.type === 'DEBIT')
  const merchantMap = {}
  
  debits.forEach(t => {
    if (!merchantMap[t.merchant]) {
      merchantMap[t.merchant] = { total: 0, count: 0, avg: 0 }
    }
    merchantMap[t.merchant].total += t.amount
    merchantMap[t.merchant].count += 1
  })
  
  return Object.entries(merchantMap)
    .filter(([, data]) => data.count >= 3)
    .map(([merchant, data]) => ({
      merchant,
      count: data.count,
      total: data.total,
      avg: Math.round(data.total / data.count),
      yearlyProjection: data.total * 12,
    }))
    .sort((a, b) => b.total - a.total)
}

export function getTimePatterns(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      Morning: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      Afternoon: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      Evening: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      Night: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    }
  }
  
  const debits = transactions.filter(t => t.type === 'debit' || t.type === 'DEBIT')
  const patterns = {
    Morning: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    Afternoon: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    Evening: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    Night: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
  }
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  debits.forEach(t => {
    const date = new Date(t.date)
    const dayName = days[date.getDay()]
    const hour = date.getHours()
    
    let timeSlot
    if (hour >= 6 && hour < 12) timeSlot = 'Morning'
    else if (hour >= 12 && hour < 17) timeSlot = 'Afternoon'
    else if (hour >= 17 && hour < 21) timeSlot = 'Evening'
    else timeSlot = 'Night'
    
    // If no time data (midnight), distribute based on merchant category heuristics
    if (hour === 0 && date.getMinutes() === 0) {
      const cat = (t.category || '').toLowerCase()
      if (cat.includes('food')) timeSlot = 'Afternoon'
      else if (cat.includes('transport')) timeSlot = 'Morning'
      else if (cat.includes('entertainment')) timeSlot = 'Evening'
      else if (cat.includes('shopping')) timeSlot = 'Afternoon'
      else timeSlot = 'Afternoon'
    }
    
    patterns[timeSlot][dayName] += t.amount
  })
  
  return patterns
}

export function getWasteAlerts(transactions) {
  if (!transactions || transactions.length === 0) return []
  const debits = transactions.filter(t => t.type === 'debit' || t.type === 'DEBIT')
  const merchantMap = {}
  
  debits.forEach(t => {
    const merchant = t.merchant
    if (!merchantMap[merchant]) {
      merchantMap[merchant] = { amounts: [], total: 0, count: 0 }
    }
    merchantMap[merchant].amounts.push(t.amount)
    merchantMap[merchant].total += t.amount
    merchantMap[merchant].count += 1
  })
  
  const wasteAlerts = []
  
  for (const [merchant, data] of Object.entries(merchantMap)) {
    const avgAmount = Math.round(data.total / data.count)
    
    // Criteria: 3+ transactions AND total >= ₹150
    if (data.count >= 3 && data.total >= 150) {
      wasteAlerts.push({
        merchant,
        count: data.count,
        average: avgAmount,
        total: data.total,
        yearlyProjection: data.total * 12,
        details: `₹${avgAmount} × ${data.count} = ₹${data.total.toLocaleString('en-IN')}`,
        insight: `💡 That's ₹${(data.total * 12).toLocaleString('en-IN')}/year! Try reducing by 50% to save ₹${(data.total * 6).toLocaleString('en-IN')}/year.`,
      })
    }
  }
  
  return wasteAlerts.sort((a, b) => b.total - a.total).slice(0, 5)
}

export function generateSavingTips(transactions) {
  if (!transactions || transactions.length === 0) return []
  const debits = transactions.filter(t => t.type === 'debit' || t.type === 'DEBIT')
  const categoryMap = {}
  const merchantMap = {}
  
  debits.forEach(t => {
    const cat = t.category || 'Other'
    categoryMap[cat] = (categoryMap[cat] || 0) + t.amount
    if (!merchantMap[t.merchant]) merchantMap[t.merchant] = { total: 0, count: 0 }
    merchantMap[t.merchant].total += t.amount
    merchantMap[t.merchant].count += 1
  })
  
  const tips = []
  const sortedCategories = Object.entries(categoryMap).sort(([, a], [, b]) => b - a)
  
  // Tip based on top spending category
  if (sortedCategories.length > 0) {
    const [topCat, topAmount] = sortedCategories[0]
    const saving = Math.round(topAmount * 0.2)
    tips.push({ tip: `Reduce ${topCat} spending by 20% — it's your #1 category`, saving: `₹${saving.toLocaleString('en-IN')}/month` })
  }
  
  // Tip for most frequent merchant
  const topMerchant = Object.entries(merchantMap).sort(([, a], [, b]) => b.count - a.count)[0]
  if (topMerchant && topMerchant[1].count >= 3) {
    const halfSaving = Math.round(topMerchant[1].total * 0.5)
    tips.push({ tip: `Cut ${topMerchant[0]} orders by half (${topMerchant[1].count} orders this month)`, saving: `₹${halfSaving.toLocaleString('en-IN')}/month` })
  }
  
  // Tip for entertainment/subscriptions
  const entAmount = categoryMap['Entertainment'] || categoryMap['entertainment'] || 0
  if (entAmount > 0) {
    tips.push({ tip: `Review entertainment subscriptions — are you using all of them?`, saving: `₹${Math.round(entAmount * 0.3).toLocaleString('en-IN')}/month` })
  }
  
  // Tip for transport
  const transAmount = categoryMap['Transport'] || categoryMap['transport'] || 0
  if (transAmount > 500) {
    tips.push({ tip: `Consider ride passes or public transport to cut commute costs`, saving: `₹${Math.round(transAmount * 0.25).toLocaleString('en-IN')}/month` })
  }
  
  // General tip based on savings rate
  const { savingsRate } = calculateTotals(transactions)
  if (savingsRate < 20) {
    tips.push({ tip: `Your savings rate is ${Math.round(savingsRate)}% — aim for 20%+ by tracking daily`, saving: 'Long-term growth' })
  }
  
  return tips.slice(0, 4)
}

export function calculateFinancialScore(transactions) {
  if (!transactions || transactions.length === 0) {
    return { grade: '?', emoji: '📊', label: 'No data' }
  }
  const { totalSpent, totalReceived } = calculateTotals(transactions)
  const savingsRate = totalReceived > 0 ? (totalReceived - totalSpent) / totalReceived : 0
  
  if (savingsRate >= 0.3) return { grade: 'A', emoji: '🌟', label: 'Excellent saver' }
  if (savingsRate >= 0.2) return { grade: 'B', emoji: '📊', label: 'Good habits' }
  if (savingsRate >= 0.1) return { grade: 'C', emoji: '📈', label: 'Room to improve' }
  if (savingsRate >= 0) return { grade: 'D', emoji: '⚠️', label: 'Needs attention' }
  return { grade: 'F', emoji: '🚨', label: 'Overspending' }
}
