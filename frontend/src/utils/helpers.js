/**
 * MedicoAI – Utility / Helper Functions
 */

/** Format a date string to DD/MM/YYYY */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Format a time string to 12-hour format */
export const formatTime = (timeStr) => {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${m} ${ampm}`
}

/** Format currency in INR */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)

/** Capitalize first letter */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

/** Get initials from full name */
export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

/** Get status badge class */
export const getStatusClass = (status) => {
  const map = {
    PENDING:     'badge-warning',
    CONFIRMED:   'badge-info',
    COMPLETED:   'badge-success',
    CANCELLED:   'badge-danger',
    RESCHEDULED: 'badge-primary',
    SUCCESS:     'badge-success',
    FAILED:      'badge-danger',
    REFUNDED:    'badge-warning',
  }
  return map[status] || 'badge-info'
}

/** Truncate long text */
export const truncate = (str, maxLen = 50) =>
  str && str.length > maxLen ? str.slice(0, maxLen) + '…' : str

/** Debounce function */
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
