import { createContext, useContext, useState, useEffect } from 'react'
import {
  authAPI,
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
} from '../utils/api'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [loading, setLoading] = useState(!!getToken())
  const [error, setError] = useState(null)

  const isAuthenticated = !!user && !!getToken()

  // Verify token on mount
  useEffect(() => {
    const token = getToken()
    if (token && !user) {
      setLoading(true)
      const timeout = setTimeout(() => {
        // If backend is unreachable after 5s, stop loading and clear stale token
        setLoading(false)
        logout()
      }, 5000)
      authAPI
        .getMe()
        .then((data) => {
          clearTimeout(timeout)
          setUser(data.user)
          setStoredUser(data.user)
        })
        .catch(() => {
          clearTimeout(timeout)
          logout()
        })
        .finally(() => setLoading(false))
    }
  }, [])

  async function register(name, email, password) {
    setError(null)
    setLoading(true)
    try {
      const data = await authAPI.register(name, email, password)
      setToken(data.token)
      setUser(data.user)
      setStoredUser(data.user)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    setError(null)
    setLoading(true)
    try {
      const data = await authAPI.login(email, password)
      setToken(data.token)
      setUser(data.user)
      setStoredUser(data.user)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    removeToken()
    removeStoredUser()
    setUser(null)
    setError(null)
  }

  function clearError() {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, error, register, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  )
}
