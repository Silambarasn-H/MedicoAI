import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import authService from '../../services/authService'
import { loginStart, loginSuccess, loginFailure } from '../../context/authSlice'
import './LoginPage.css'

/* ── SVG icon helpers (no extra dependency) ── */
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

/* ── Demo credentials for quick testing ── */
const DEMO_USERS = [
  { label: '👨‍💼 Admin',   email: 'admin@medicoai.com',   password: 'Admin@123'   },
  { label: '👨‍⚕️ Doctor',  email: 'doctor@medicoai.com',  password: 'Doctor@123'  },
  { label: '🧑 Patient', email: 'patient@medicoai.com', password: 'Patient@123' },
]

/* ── Validation ── */
function validate(email, password) {
  const errors = {}
  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }
  return errors
}

/* ════════════════════════════════════════════════════════════
   LoginPage Component
   ════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { token, user } = useSelector((state) => state.auth)

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError,    setApiError]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [touched,     setTouched]     = useState({ email: false, password: false })

  /* Redirect if already logged in */
  useEffect(() => {
    if (token && user) {
      const map = { ADMIN: '/admin', DOCTOR: '/doctor', PATIENT: '/patient' }
      navigate(map[user.role] || '/patient', { replace: true })
    }
  }, [token, user, navigate])

  /* Live validation after field is touched */
  useEffect(() => {
    if (touched.email || touched.password) {
      setFieldErrors(validate(email, password))
    }
  }, [email, password, touched])

  /* ── Handlers ── */
  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const fillDemo = (demo) => {
    setEmail(demo.email)
    setPassword(demo.password)
    setFieldErrors({})
    setApiError('')
    setTouched({ email: false, password: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })

    const errors = validate(email, password)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    setApiError('')
    dispatch(loginStart())

    try {
      const { data } = await authService.login({ email: email.trim().toLowerCase(), password })

      /* data shape: { success, message, data: AuthResponse } */
      const authData = data.data
      dispatch(loginSuccess(authData))
      toast.success(`Welcome back, ${authData.fullName}!`)

      const map = { ADMIN: '/admin', DOCTOR: '/doctor', PATIENT: '/patient' }
      navigate(map[authData.role] || '/patient', { replace: true })

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401 ? 'Invalid email or password' : 'Login failed. Please try again.')
      setApiError(msg)
      dispatch(loginFailure(msg))
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /* ── Render ── */
  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🏥</div>
          <span className="auth-logo-text">MedicoAI</span>
        </div>
        <p className="auth-subtitle">AI Powered Hospital Management</p>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
          Sign in to your account
        </p>

        {/* API error banner */}
        {apiError && (
          <div className="auth-error-banner" role="alert">
            <IconAlert />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><IconMail /></span>
              <input
                id="email"
                type="email"
                className={`auth-input${fieldErrors.email && touched.email ? ' input-error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
                disabled={loading}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                aria-invalid={!!fieldErrors.email && touched.email}
              />
            </div>
            {fieldErrors.email && touched.email && (
              <span className="auth-field-error" id="email-error" role="alert">
                <IconAlert /> {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><IconLock /></span>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                className={`auth-input${fieldErrors.password && touched.password ? ' input-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                autoComplete="current-password"
                disabled={loading}
                aria-describedby={fieldErrors.password ? 'pw-error' : undefined}
                aria-invalid={!!fieldErrors.password && touched.password}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPw ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {fieldErrors.password && touched.password && (
              <span className="auth-field-error" id="pw-error" role="alert">
                <IconAlert /> {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Forgot password */}
          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo quick-fill */}
        <div className="auth-divider" style={{ marginTop: '1.5rem' }}>
          <span>Quick demo login</span>
        </div>
        <div className="auth-demo-roles">
          {DEMO_USERS.map((d) => (
            <button
              key={d.label}
              type="button"
              className="demo-role-btn"
              onClick={() => fillDemo(d)}
              disabled={loading}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Register link */}
        <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>

      </div>
    </div>
  )
}
