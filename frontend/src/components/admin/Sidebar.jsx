import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../context/authSlice'

const NAV = [
  {
    section: 'Overview',
    items: [
      { to: '/admin',              icon: '📊', label: 'Dashboard',    end: true },
    ],
  },
  {
    section: 'Management',
    items: [
      { to: '/admin/doctors',       icon: '👨‍⚕️', label: 'Doctors'        },
      { to: '/admin/patients',      icon: '🧑‍🤝‍🧑', label: 'Patients'       },
      { to: '/admin/appointments',  icon: '📅', label: 'Appointments'   },
      { to: '/admin/prescriptions', icon: '💊', label: 'Prescriptions'  },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { to: '/admin/reports',      icon: '📈', label: 'Reports'       },
    ],
  },
  {
    section: 'System',
    items: [
      { to: '/admin/notifications',icon: '🔔', label: 'Notifications', badge: true },
      { to: '/admin/settings',     icon: '⚙️', label: 'Settings'      },
    ],
  },
]

export default function Sidebar({ open, onClose, unreadCount = 0 }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useSelector((s) => s.auth)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  const handleLogout = () => {
    setMenuOpen(false)
    dispatch(logout())
    navigate('/login')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99 }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏥</div>
          <div>
            <div className="sidebar-logo-text">MedicoAI</div>
            <div className="sidebar-logo-sub">Admin Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="sidebar-section-label">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `sidebar-item${isActive ? ' active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  {item.label}
                  {item.badge && unreadCount > 0 && (
                    <span className="sidebar-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer with dropdown */}
        <div className="sidebar-footer" ref={menuRef} style={{ position: 'relative' }}>

          {/* Dropdown menu — renders above the profile card */}
          {menuOpen && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '0.75rem',
              right: '0.75rem',
              marginBottom: '0.5rem',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 -8px 24px rgba(0,0,0,0.4)',
              zIndex: 200,
            }}>
              <button
                onClick={() => { setMenuOpen(false); navigate('/admin/settings') }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: '0.6rem', padding: '0.7rem 1rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#cbd5e1', fontSize: '0.85rem', fontFamily: 'inherit',
                  transition: 'background 0.15s', textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>⚙️</span> Profile &amp; Settings
              </button>
              <div style={{ height: '1px', background: '#334155', margin: '0 0.75rem' }} />
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: '0.6rem', padding: '0.7rem 1rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#f87171', fontSize: '0.85rem', fontFamily: 'inherit',
                  transition: 'background 0.15s', textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>↩</span> Logout
              </button>
            </div>
          )}

          {/* Profile card — click opens dropdown, no longer logs out */}
          <div
            className="sidebar-user"
            onClick={() => setMenuOpen((v) => !v)}
            title="Account menu"
            style={{ cursor: 'pointer' }}
          >
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName || 'Admin'}</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
            <span style={{
              color: '#64748b', fontSize: '0.75rem',
              transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              display: 'inline-block',
            }}>▲</span>
          </div>
        </div>
      </aside>
    </>
  )
}
