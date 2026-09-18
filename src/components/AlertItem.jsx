function AlertItem({ merchant, details, insight, bgColor = 'bg-orange-50' }) {
  return (
    <div className={`${bgColor} rounded-xl p-4 border border-orange-100 transition-all duration-200 hover:shadow-sm`}>
      <div className="flex justify-between items-start mb-1.5">
        <span className="font-semibold text-gray-800">{merchant}</span>
        <span className="font-mono font-bold text-error text-sm bg-red-50 px-2 py-0.5 rounded-full">{details}</span>
      </div>
      <p className="text-small text-neutral leading-relaxed">{insight}</p>
    </div>
  )
}

export default AlertItem
