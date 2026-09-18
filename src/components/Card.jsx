function Card({ children, className = '', hover = true, glow = false }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${
      hover ? 'transition-all duration-300 hover:shadow-md hover:-translate-y-1' : ''
    } ${glow ? 'glow' : ''} ${className}`}>
      {children}
    </div>
  )
}

export default Card
