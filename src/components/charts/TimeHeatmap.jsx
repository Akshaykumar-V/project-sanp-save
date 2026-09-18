function TimeHeatmap({ patterns }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night']
  
  const maxValue = Math.max(...timeSlots.flatMap(slot => days.map(day => patterns[slot]?.[day] || 0)))
  
  const getColor = (value) => {
    if (!value || value === 0) return '#F3F4F6'
    const intensity = value / maxValue
    if (intensity < 0.25) return '#DBEAFE'
    if (intensity < 0.5) return '#93C5FD'
    if (intensity < 0.75) return '#3B82F6'
    return '#1D4ED8'
  }
  
  const formatAmount = (value) => value ? `₹${Math.round(value).toLocaleString('en-IN')}` : '₹0'
  
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Header row */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
          <div />
          {days.map(day => (
            <div key={day} className="text-caption font-semibold text-neutral text-center">{day}</div>
          ))}
        </div>
        
        {/* Data rows */}
        {timeSlots.map(slot => (
          <div key={slot} className="grid gap-1 mb-1" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
            <div className="text-caption font-medium text-neutral flex items-center">{slot}</div>
            {days.map(day => {
              const value = patterns[slot]?.[day] || 0
              return (
                <div
                  key={day}
                  className="h-10 rounded flex items-center justify-center text-xs font-medium transition-all duration-200 hover:opacity-80 cursor-default"
                  style={{ backgroundColor: getColor(value), color: value > maxValue * 0.5 ? 'white' : '#374151' }}
                  title={`${slot} ${day}: ${formatAmount(value)}`}
                >
                  {value > 0 ? `₹${Math.round(value / 100) * 100 > 999 ? Math.round(value / 1000) + 'k' : Math.round(value)}` : ''}
                </div>
              )
            })}
          </div>
        ))}
        
        {/* Legend */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-caption text-neutral">Less</span>
          {['#F3F4F6', '#DBEAFE', '#93C5FD', '#3B82F6', '#1D4ED8'].map((color, i) => (
            <div key={i} className="w-6 h-4 rounded" style={{ backgroundColor: color }} />
          ))}
          <span className="text-caption text-neutral">More</span>
        </div>
      </div>
    </div>
  )
}

export default TimeHeatmap
