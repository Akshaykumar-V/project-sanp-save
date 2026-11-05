import { createContext, useContext, useState, useEffect, useRef } from 'react'
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
  const [user, setUser] = useState(() => getToken() ? getStoredUser() : null)
  const [loading, setLoading] = useState(!!getToken())
  const [error, setError] = useState(null)
  const sessionVersion = useRef(0)

  const isAuthenticated = !!user && !!getToken()

  // A cached user is only a placeholder until the token is verified.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      removeStoredUser()
      setUser(null)
      setLoading(false)
      return
    }

    const version = ++sessionVersion.current
    let active = true
    const isCurrent = () => active && sessionVersion.current === version
    const clearSession = () => {
      removeToken()
      removeStoredUser()
      setUser(null)
    }
    const timeout = setTimeout(() => {
      if (!isCurrent()) return
      active = false
      clearSession()
      setLoading(false)
    }, 5000)

    authAPI.getMe()
      .then((data) => {
        if (!isCurrent()) return
        if (!data?.user) throw new Error('Invalid session')
        setUser(data.user)
        setStoredUser(data.user)
      })
      .catch(() => {
        if (isCurrent()) clearSession()
      })
      .finally(() => {
        if (!isCurrent()) return
        clearTimeout(timeout)
        setLoading(false)
      })

    return () => {
      active = false
      clearTimeout(timeout)
    }
    // Session restoration runs once when the provider mounts.
  }, [])

  async function register(name, email, password) {
    sessionVersion.current += 1
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
    sessionVersion.current += 1
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
    sessionVersion.current += 1
    removeToken()
    removeStoredUser()
    setUser(null)
    setError(null)
    setLoading(false)
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
