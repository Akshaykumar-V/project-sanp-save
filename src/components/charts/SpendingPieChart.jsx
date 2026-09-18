import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

function SpendingPieChart({ data }) {
  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`
  
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    if (percentage < 5) return null
    
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${percentage}%`}
      </text>
    )
  }
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-gray-100">
          <p className="font-semibold text-gray-800">{item.name}</p>
          <p className="font-mono text-primary font-bold">{formatCurrency(item.value)}</p>
          <p className="text-neutral text-sm">{item.payload.percentage}% of spending</p>
        </div>
      )
    }
    return null
  }
  
  const renderLegend = ({ payload }) => (
    <div className="grid grid-cols-1 gap-2 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-700">{entry.value}</span>
          </div>
          <span className="font-mono font-medium text-gray-800">
            {formatCurrency(entry.payload.value)} ({entry.payload.percentage}%)
          </span>
        </div>
      ))}
    </div>
  )
  
  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={40}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {renderLegend({ payload: data.map(d => ({ value: d.name, color: d.color, payload: d })) })}
    </div>
  )
}

export default SpendingPieChart
