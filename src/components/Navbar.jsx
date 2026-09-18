import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar({ showTabs = false }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  
  const tabs = [
    { path: '/dashboard', label: 'Dashboard', emoji: '📊' },
    { path: '/insights', label: 'Insights', emoji: '🔍' },
    { path: '/goals', label: 'Goals', emoji: '🎯' },
  ]
  
  const isActive = (path) => location.pathname === path
  
  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 no-underline group">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold gradient-text">SnapSave</span>
            </Link>
            
            {showTabs && (
              <div className="hidden md:flex items-center gap-1 bg-gray-50 rounded-full px-1 py-1">
                {tabs.map(tab => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`px-5 py-2 font-medium text-sm rounded-full transition-all duration-300 no-underline ${
                      isActive(tab.path)
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-neutral hover:text-primary-dark'
                    }`}
                  >
                    {tab.emoji} {tab.label}
                  </Link>
                ))}
              </div>
            )}
            
            <div className="hidden md:flex items-center gap-3">
              {showTabs && (
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:shadow-btn-hover hover:-translate-y-0.5 transition-all duration-200 no-underline"
                >
                  📁 Upload
                </Link>
              )}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {user?.name?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="text-sm text-neutral hover:text-error transition-colors p-2 rounded-full hover:bg-red-50"
                  >
                    ↪ Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="text-sm font-semibold text-primary bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors no-underline"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Bottom Navigation */}
      {showTabs && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
          <div className="grid grid-cols-4 h-16">
            {[...tabs, { path: '/upload', label: 'Upload', emoji: '📁' }].map(tab => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium no-underline transition-all duration-200 ${
                  isActive(tab.path) ? 'text-primary scale-105' : 'text-neutral'
                }`}
              >
                <span className={`text-lg transition-transform duration-200 ${isActive(tab.path) ? 'scale-110' : ''}`}>{tab.emoji}</span>
                {tab.label}
                {isActive(tab.path) && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  )
}

export default Navbar
