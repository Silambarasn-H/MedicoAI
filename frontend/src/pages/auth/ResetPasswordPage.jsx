import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import authService from '../../services/authService'
import './LoginPage.css'

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

function validate(newPassword, confirmPassword) {
  const errors = {}
  if (!newPassword)
    errors.newPassword = 'New password is required'
  else if (newPassword.length < 8)
    errors.newPassword = 'Password must be at least 8 characters'
  else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword))
    errors.newPassword = 'Must include uppercase, lowercase, number & special character'
  if (!confirmPassword)
    errors.confirmPassword = 'Please confirm your password'
  else if (newPassword !== confirmPassword)
    errors.confirmPassword = 'Passwords do not match'
  return errors
}

export default function ResetPasswordPage() {
  const navigate        = useNavigate()
  const [searchParams]  = useSearchParams()
  const token           = searchParams.get('token')

  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw,          setShowPw]          = useState({ new: false, confirm: false })
  const [errors,          setErrors]          = useState({})
  const [touched,         setTouched]         = useState({})
  const [apiError,        setApiError]        = useState('')
  const [loading,         setLoading]         = useState(false)
  const [success,         setSuccess]         = useState(false)

  // Redirect if no token in URL
  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.')
      navigate('/forgot-password', { replace: true })
    }
  }, [token, navigate])

  const handleBlur = (field) => {
    setTouched(p => ({ ...p, [field]: true }))
    setErrors(validate(newPassword, confirmPassword))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ newPassword: true, confirmPassword: true })
    const errs = validate(newPassword, confirmPassword)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    setApiError('')
    try {
      await authService.resetPassword({ token, newPassword, confirmPassword })
      setSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.'
      setApiError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const showErr = (f) => errors[f] && touched[f]

  if (!token) return null

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon">🏥</div>
          <span className="auth-logo-text">MedicoAI</span>
        </div>
        <p className="auth-subtitle">AI Powered Hospital Management</p>

        {success ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(74,222,128,0.15)',
              border: '2px solid rgba(74,222,128,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', margin: '0 auto 1rem',
            }}>✅</div>
            <h1 className="auth-title">Password Reset!</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
              Your password has been updated. Redirecting to login…
            </p>
          </div>
        ) : (
          /* ── Reset form ── */
          <>
            <h1 className="auth-title">Set new password</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
              Choose a strong password for your account
            </p>

            {apiError && (
              <div className="auth-error-banner" role="alert">
                <IconAlert /><span>{apiError}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>

              {/* New Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="rp-newpw">New Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IconLock /></span>
                  <input
                    id="rp-newpw" type={showPw.new ? 'text' : 'password'}
                    className={`auth-input${showErr('newPassword') ? ' input-error' : ''}`}
                    placeholder="Min 8 chars, A-Z, 0-9, @$!"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); if (touched.newPassword) setErrors(validate(e.target.value, confirmPassword)) }}
                    onBlur={() => handleBlur('newPassword')}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button type="button" className="auth-pw-toggle"
                    onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                    tabIndex={-1} aria-label="Toggle password">
                    {showPw.new ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {showErr('newPassword') && (
                  <span className="auth-field-error" role="alert">
                    <IconAlert /> {errors.newPassword}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="rp-confirmpw">Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IconLock /></span>
                  <input
                    id="rp-confirmpw" type={showPw.confirm ? 'text' : 'password'}
                    className={`auth-input${showErr('confirmPassword') ? ' input-error' : ''}`}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (touched.confirmPassword) setErrors(validate(newPassword, e.target.value)) }}
                    onBlur={() => handleBlur('confirmPassword')}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button type="button" className="auth-pw-toggle"
                    onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                    tabIndex={-1} aria-label="Toggle confirm password">
                    {showPw.confirm ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {showErr('confirmPassword') && (
                  <span className="auth-field-error" role="alert">
                    <IconAlert /> {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button type="submit" className="auth-btn" disabled={loading} aria-busy={loading}>
                {loading
                  ? <><span className="btn-spinner" aria-hidden="true" /> Resetting…</>
                  : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
          <Link to="/login">← Back to Login</Link>
        </p>

      </div>
    </div>
  )
}
