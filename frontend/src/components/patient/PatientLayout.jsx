import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../context/authSlice'
/* Reuse the exact same admin.css — same dark design system */
import '../admin/admin.css'

const NAV = [
  { section: 'Overview', items: [
    { to: '/patient',               icon: '📊', label: 'Dashboard',      end: true },
  ]},
  { section: 'My Health', items: [
    { to: '/patient/book',          icon: '📅', label: 'Book Appointment' },
    { to: '/patient/prescriptions', icon: '💊', label: 'Prescriptions'   },
    { to: '/patient/reports',       icon: '📋', label: 'Reports'         },
  ]},
  { section: 'Account', items: [
    { to: '/patient/payments',      icon: '💳', label: 'Payments'        },
    { to: '/patient/profile',       icon: '👤', label: 'My Profile'      },
  ]},
]

const PAGE_TITLES = {
  '/patient':               { title: 'Dashboard',       sub: 'Your health overview' },
  '/patient/book':          { title: 'Book Appointment', sub: 'Schedule a consultation' },
  '/patient/prescriptions': { title: 'Prescriptions',   sub: 'Your prescriptions' },
  '/patient/reports':       { title: 'Reports',         sub: 'Medical reports' },
  '/patient/payments':      { title: 'Payments',        sub: 'Payment history' },
  '/patient/profile':       { title: 'My Profile',      sub: 'Account settings' },
}

export default function PatientLayout() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const location   = useLocation()
  const { user }   = useSelector((s) => s.auth)
  const [open, setOpen] = useState(false)

  const meta     = PAGE_TITLES[location.pathname] || { title: 'Patient', sub: '' }
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PT'

  const handleLogout = () => { dispatch(logout()); navigate('/login') }

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {open && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <div>
            <div className="sidebar-logo-text">MedicoAI</div>
            <div className="sidebar-logo-sub">Patient Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="sidebar-section-label">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName || 'Patient'}</div>
              <div className="sidebar-user-role">Patient</div>
            </div>
            <span style={{ color:'#64748b', fontSize:'0.85rem' }}>↩</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle sidebar">☰</button>
          <div>
            <div className="topbar-title">{meta.title}</div>
            {meta.sub && <div className="topbar-breadcrumb">{meta.sub}</div>}
          </div>
          <div className="topbar-actions">
            <button className="topbar-btn" title="Toggle theme">🌙</button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
