function StatCard({ icon, label, amount, change, changeType = 'neutral' }) {
  const changeColors = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-neutral',
  }
  const changeBg = {
    positive: 'bg-green-50',
    negative: 'bg-red-50',
    neutral: 'bg-gray-50',
  }
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <p className="text-caption uppercase tracking-widest text-neutral font-semibold mb-1.5">{label}</p>
      <p className="font-mono text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">{amount}</p>
      {change && (
        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${changeColors[changeType]} ${changeBg[changeType]}`}>
          {changeType === 'positive' && '↑'}{changeType === 'negative' && '↓'}{changeType === 'neutral' && '→'} {change}
        </div>
      )}
    </div>
  )
}

export default StatCard
