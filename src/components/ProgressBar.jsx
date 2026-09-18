function ProgressBar({ value, max = 100, height = 8, color = '#0066FF', label, showLabel = true, className = '' }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)
  
  const getColor = () => {
    if (color) return color
    if (percentage >= 100) return '#FF3B3B'
    if (percentage >= 80) return '#FFAA33'
    return '#00C48C'
  }
  
  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: getColor(),
          }}
        >
          {showLabel && height >= 20 && (
            <span className="px-2 text-white text-xs font-semibold flex items-center h-full">
              {percentage}%
            </span>
          )}
        </div>
      </div>
      {label && <p className="text-caption text-neutral mt-1">{label}</p>}
    </div>
  )
}

export default ProgressBar
