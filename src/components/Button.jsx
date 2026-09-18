function Button({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false, type = 'button' }) {
  const baseStyles = 'font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer border-0'
  
  const variants = {
    primary: 'bg-primary text-white rounded-sm hover:shadow-btn-hover hover:-translate-y-0.5 active:scale-95',
    secondary: 'bg-transparent text-primary border-2 border-primary rounded-sm hover:bg-primary-light hover:-translate-y-0.5',
    ghost: 'bg-transparent text-neutral hover:bg-gray-100 rounded-sm',
  }
  
  const sizes = {
    sm: 'h-9 px-4 py-2 text-sm',
    md: 'h-12 px-6 py-3 text-base',
    lg: 'h-14 px-8 py-4 text-base',
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
