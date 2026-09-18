import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function DailyBarChart({ data }) {
  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-gray-100">
          <p className="font-semibold text-gray-800">Day {label}</p>
          <p className="font-mono text-primary font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `₹${v}`}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="amount" fill="#0066FF" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default DailyBarChart
