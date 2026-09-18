import Badge from '../Badge'

function BudgetProgress({ budgets }) {
  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`
  
  const getStatus = (spent, budget) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return { variant: 'error', text: '🔴 Budget reached!', color: '#FF3B3B' }
    if (percentage >= 80) return { variant: 'warning', text: '⚠️ Getting close', color: '#FFAA33' }
    return { variant: 'success', text: '✅ On track', color: '#00C48C' }
  }
  
  return (
    <div className="space-y-4">
      {budgets.map((budget, index) => {
        const percentage = Math.min(Math.round((budget.spent / budget.limit) * 100), 100)
        const status = getStatus(budget.spent, budget.limit)
        
        return (
          <div key={index} className="p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-semibold text-gray-800">{budget.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={status.variant}>{status.text}</Badge>
              </div>
            </div>
            <div className="flex justify-between text-sm text-neutral mb-2">
              <span className="font-mono">{formatCurrency(budget.spent)} spent</span>
              <span className="font-mono">of {formatCurrency(budget.limit)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%`, backgroundColor: status.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default BudgetProgress
