import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../context/authSlice'

/**
 * ComingSoon – renders inside whatever layout wraps it.
 * Does NOT force a full-screen background so it works inside
 * AdminLayout, DoctorLayout, PatientLayout without breaking the sidebar.
 */
export default function ComingSoon({ title = 'Dashboard', icon = '🏥' }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem',
      color: '#f1f5f9',
    }}>
      {/* Icon circle */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem',
        boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
      }}>
        {icon}
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#f1f5f9' }}>
        {title}
      </h1>

      <p style={{ color: '#64748b', maxWidth: 340, fontSize: '0.9rem', lineHeight: 1.6 }}>
        This module is under active development and will be available soon.
      </p>

      {/* Pill badge */}
      <span style={{
        padding: '0.3rem 1rem',
        background: 'rgba(99,102,241,0.15)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '999px',
        fontSize: '0.75rem',
        color: '#a5b4fc',
        fontWeight: 600,
      }}>
        Coming Soon
      </span>

      <button
        onClick={handleLogout}
        style={{
          marginTop: '0.5rem',
          padding: '0.6rem 1.5rem',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid #334155',
          borderRadius: '8px',
          color: '#94a3b8',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#e2e8f0' }}
        onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = '#94a3b8' }}
      >
        ← Logout
      </button>
    </div>
  )
}
