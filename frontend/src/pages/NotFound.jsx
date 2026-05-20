import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '5rem' }}>🏥</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: 0 }}>404</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
        Page not found
      </p>
      <Link to="/login" style={{
        marginTop: '1rem',
        padding: '0.75rem 2rem',
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        borderRadius: '12px',
        color: '#fff',
        fontWeight: 700,
        textDecoration: 'none',
      }}>
        Go to Login
      </Link>
    </div>
  )
}
