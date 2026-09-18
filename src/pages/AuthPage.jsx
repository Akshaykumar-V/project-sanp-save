import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { login, register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()

  function switchMode() {
    setIsLogin(!isLogin)
    setName('')
    setEmail('')
    setPassword('')
    clearError()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      navigate('/dashboard')
    } catch {
      // error is set in context
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">💰</span>
          <span className="text-white text-xl font-bold">SnapSave</span>
        </Link>
      </nav>

      {/* Auth Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 page-enter relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 md:p-10">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center text-3xl">
              {isLogin ? '👋' : '🚀'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-neutral text-sm">
              {isLogin
                ? 'Log in to access your expense dashboard'
                : 'Start tracking your expenses today'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
              <span>❌</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name (register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Akshay Kumar"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral hover:text-gray-700 text-sm p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-neutral mt-1.5">Minimum 6 characters</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl shadow-sm hover:shadow-btn-hover hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading
                ? '⏳ Please wait...'
                : isLogin
                  ? '🔐 Log In'
                  : '✨ Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-neutral font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Switch mode */}
          <p className="text-center text-sm text-neutral">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>

          {/* Demo access */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link
              to="/dashboard"
              className="text-xs text-neutral hover:text-primary transition-colors no-underline"
            >
              🔍 View demo dashboard without account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
