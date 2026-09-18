const STORAGE_KEY = 'snapsave_transactions'
const META_KEY = 'snapsave_meta'

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch (e) {
    console.error('Failed to save transactions:', e)
  }
}

export function loadTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Failed to load transactions:', e)
    return null
  }
}

export function saveMeta(meta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch (e) {
    console.error('Failed to save meta:', e)
  }
}

export function loadMeta() {
  try {
    const data = localStorage.getItem(META_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

export function clearAll() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(META_KEY)
}
