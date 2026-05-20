import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import authService from '../../services/authService'
import './LoginPage.css'

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
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

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('')
  const [error,     setError]     = useState('')
  const [sent,      setSent]      = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [devLink,   setDevLink]   = useState('')   // only set in dev mode

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return }

    setLoading(true)
    setError('')
    try {
      const { data } = await authService.forgotPassword({ email: email.trim().toLowerCase() })
      // data.data.resetLink is present only in dev mode
      if (data?.data?.resetLink) setDevLink(data.data.resetLink)
      setSent(true)
      toast.success('Reset link sent! Check your inbox.')
    } catch (err) {
      // Never reveal if email exists — show generic message
      setSent(true)
      toast.info('If that email is registered, a reset link has been sent.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon">🏥</div>
          <span className="auth-logo-text">MedicoAI</span>
        </div>
        <p className="auth-subtitle">AI Powered Hospital Management</p>

        {sent ? (
          /* ── Success state ── */
          <>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(74,222,128,0.15)',
                border: '2px solid rgba(74,222,128,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', margin: '0 auto 1rem',
              }}>✉️</div>
              <h1 className="auth-title">Check your email</h1>
              <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
                If <strong style={{ color: '#a5b4fc' }}>{email}</strong> is registered,
                we've sent a password reset link. It expires in 15 minutes.
              </p>
              <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1.5rem' }}>
                Didn't receive it? Check your spam folder or try again.
              </p>

              {/* Dev mode: show clickable reset link for testing */}
              {devLink && (
                <div style={{
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.35)',
                  borderRadius: '10px',
                  padding: '0.9rem 1rem',
                  marginBottom: '1.25rem',
                  textAlign: 'left',
                }}>
                  <p style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🛠 Dev Mode — Reset Link
                  </p>
                  <a
                    href={devLink}
                    style={{
                      fontSize: '0.78rem',
                      color: '#818cf8',
                      wordBreak: 'break-all',
                      lineHeight: 1.5,
                    }}
                  >
                    {devLink}
                  </a>
                </div>
              )}
              <button
                className="auth-btn"
                onClick={() => { setSent(false); setEmail('') }}
                style={{ marginBottom: '0.75rem' }}
              >
                Try a different email
              </button>
            </div>
          </>
        ) : (
          /* ── Email form ── */
          <>
            <h1 className="auth-title">Forgot password?</h1>
            <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
              Enter your email and we'll send you a reset link
            </p>

            {error && (
              <div className="auth-error-banner" role="alert">
                <IconAlert /><span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="fp-email">Email address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IconMail /></span>
                  <input
                    id="fp-email" type="email"
                    className={`auth-input${error ? ' input-error' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading} aria-busy={loading}>
                {loading
                  ? <><span className="btn-spinner" aria-hidden="true" /> Sending…</>
                  : 'Send Reset Link'}
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
