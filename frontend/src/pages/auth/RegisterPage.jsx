import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import authService from '../../services/authService'
import { loginStart, loginSuccess, loginFailure } from '../../context/authSlice'
import './LoginPage.css' /* reuse same stylesheet */

/* ── Inline SVGs ── */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

/* ── Validation ── */
function validate(fields) {
  const e = {}
  if (!fields.fullName.trim())
    e.fullName = 'Full name is required'
  else if (fields.fullName.trim().length < 2)
    e.fullName = 'Name must be at least 2 characters'

  if (!fields.email.trim())
    e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    e.email = 'Enter a valid email address'

  if (fields.phone && !/^[6-9]\d{9}$/.test(fields.phone))
    e.phone = 'Enter a valid 10-digit mobile number'

  if (!fields.password)
    e.password = 'Password is required'
  else if (fields.password.length < 8)
    e.password = 'Password must be at least 8 characters'
  else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/.test(fields.password))
    e.password = 'Must include uppercase, lowercase, number & special character'

  return e
}

/* ════════════════════════════════════════════════════════════
   RegisterPage Component
   ════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, user } = useSelector((state) => state.auth)

  const [fields, setFields] = useState({
    fullName: '', email: '', phone: '', password: '', role: 'PATIENT',
  })
  const [showPw,      setShowPw]      = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError,    setApiError]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [touched,     setTouched]     = useState({})

  /* Redirect if already logged in */
  useEffect(() => {
    if (token && user) {
      const map = { ADMIN: '/admin', DOCTOR: '/doctor', PATIENT: '/patient' }
      navigate(map[user.role] || '/patient', { replace: true })
    }
  }, [token, user, navigate])

  /* Live validation */
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setFieldErrors(validate(fields))
    }
  }, [fields, touched])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const allTouched = Object.fromEntries(
      Object.keys(fields).map((k) => [k, true])
    )
    setTouched(allTouched)

    const errors = validate(fields)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    setApiError('')
    dispatch(loginStart())

    try {
      const payload = {
        fullName: fields.fullName.trim(),
        email:    fields.email.trim().toLowerCase(),
        password: fields.password,
        role:     fields.role,
        ...(fields.phone && { phone: fields.phone }),
      }

      const { data } = await authService.register(payload)
      const authData = data.data

      dispatch(loginSuccess(authData))
      toast.success(`Account created! Welcome, ${authData.fullName}!`)

      const map = { ADMIN: '/admin', DOCTOR: '/doctor', PATIENT: '/patient' }
      navigate(map[authData.role] || '/patient', { replace: true })

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      setApiError(msg)
      dispatch(loginFailure(msg))
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const showErr = (field) => fieldErrors[field] && touched[field]

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🏥</div>
          <span className="auth-logo-text">MedicoAI</span>
        </div>
        <p className="auth-subtitle">AI Powered Hospital Management</p>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
          Join MedicoAI today
        </p>

        {/* API error */}
        {apiError && (
          <div className="auth-error-banner" role="alert">
            <IconAlert />
            <span>{apiError}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="fullName">Full name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><IconUser /></span>
              <input
                id="fullName" name="fullName" type="text"
                className={`auth-input${showErr('fullName') ? ' input-error' : ''}`}
                placeholder="John Doe"
                value={fields.fullName}
                onChange={handleChange}
                onBlur={() => handleBlur('fullName')}
                disabled={loading}
                autoComplete="name"
              />
            </div>
            {showErr('fullName') && (
              <span className="auth-field-error" role="alert">
                <IconAlert /> {fieldErrors.fullName}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><IconMail /></span>
              <input
                id="email" name="email" type="email"
                className={`auth-input${showErr('email') ? ' input-error' : ''}`}
                placeholder="you@example.com"
                value={fields.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {showErr('email') && (
              <span className="auth-field-error" role="alert">
                <IconAlert /> {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Phone (optional) */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="phone">
              Phone <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><IconPhone /></span>
              <input
                id="phone" name="phone" type="tel"
                className={`auth-input${showErr('phone') ? ' input-error' : ''}`}
                placeholder="9876543210"
                value={fields.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                disabled={loading}
                autoComplete="tel"
                maxLength={10}
              />
            </div>
            {showErr('phone') && (
              <span className="auth-field-error" role="alert">
                <IconAlert /> {fieldErrors.phone}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><IconLock /></span>
              <input
                id="reg-password" name="password"
                type={showPw ? 'text' : 'password'}
                className={`auth-input${showErr('password') ? ' input-error' : ''}`}
                placeholder="Min 8 chars, A-Z, 0-9, @$!%"
                value={fields.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button" className="auth-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPw ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {showErr('password') && (
              <span className="auth-field-error" role="alert">
                <IconAlert /> {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Role selector */}
          <div className="auth-field">
            <label className="auth-label">Register as</label>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {['PATIENT', 'DOCTOR', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className="demo-role-btn"
                  disabled={loading}
                  onClick={() => setFields((prev) => ({ ...prev, role: r }))}
                  style={fields.role === r ? {
                    background: 'rgba(99,102,241,0.25)',
                    borderColor: '#6366f1',
                    color: '#a5b4fc',
                    fontWeight: 700,
                  } : {}}
                >
                  {r === 'PATIENT' ? '🧑 Patient' : r === 'DOCTOR' ? '👨‍⚕️ Doctor' : '👨‍💼 Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            aria-busy={loading}
            style={{ marginTop: '0.6rem' }}
          >
            {loading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>

      </div>
    </div>
  )
}
