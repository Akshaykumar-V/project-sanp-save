const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function getToken() {
  return localStorage.getItem('snapsave_token')
}

export function setToken(token) {
  localStorage.setItem('snapsave_token', token)
}

export function removeToken() {
  localStorage.removeItem('snapsave_token')
}

export function getStoredUser() {
  const raw = localStorage.getItem('snapsave_user')
  return raw ? JSON.parse(raw) : null
}

export function setStoredUser(user) {
  localStorage.setItem('snapsave_user', JSON.stringify(user))
}

export function removeStoredUser() {
  localStorage.removeItem('snapsave_user')
}

async function request(endpoint, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data
  try {
    data = await res.json()
  } catch {
    throw new Error('Server returned an invalid response')
  }
  if (!res.ok) {
    if (res.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
      // Auto-logout on expired/invalid token for protected endpoints
      removeToken()
      removeStoredUser()
      window.location.href = '/auth'
    }
    throw new Error(data.message || 'Something went wrong')
  }
  return data
}

// Auth API calls
export const authAPI = {
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  getMe: () =>
    request('/auth/me', { auth: true }),
}

// Transaction API calls
export const transactionAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/transactions${query ? `?${query}` : ''}`, { auth: true })
  },
  getSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/transactions/summary${query ? `?${query}` : ''}`, { auth: true })
  },
  create: (transactions) =>
    request('/transactions', { method: 'POST', body: { transactions }, auth: true }),
  update: (id, data) =>
    request(`/transactions/${id}`, { method: 'PUT', body: data, auth: true }),
  delete: (id) =>
    request(`/transactions/${id}`, { method: 'DELETE', auth: true }),
  deleteAll: () =>
    request('/transactions/all', { method: 'DELETE', auth: true }),
}

// Upload API (multipart — no JSON content-type)
export async function uploadPDF(file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('pdf', file)

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Upload failed')
  return data
}

// Goal API calls
export const goalAPI = {
  getAll: (month) => {
    const query = month ? `?month=${month}` : ''
    return request(`/goals${query}`, { auth: true })
  },
  create: (goalData) =>
    request('/goals', { method: 'POST', body: goalData, auth: true }),
  update: (id, data) =>
    request(`/goals/${id}`, { method: 'PUT', body: data, auth: true }),
  delete: (id) =>
    request(`/goals/${id}`, { method: 'DELETE', auth: true }),
}

// AI Tips
export const aiAPI = {
  generateTips: () =>
    request('/ai/tips', { method: 'POST', auth: true }),
}
