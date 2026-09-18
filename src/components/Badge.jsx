function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-orange-50 text-orange-700 border border-orange-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    default: 'bg-gray-50 text-gray-700 border border-gray-200',
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-caption font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
