import React from 'react'
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
      { to: '/admin/doctors',      icon: '👨‍⚕️', label: 'Doctors'       },
      { to: '/admin/patients',     icon: '🧑‍🤝‍🧑', label: 'Patients'      },
      { to: '/admin/appointments', icon: '📅', label: 'Appointments'  },
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

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

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

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName || 'Admin'}</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>↩</span>
          </div>
        </div>
      </aside>
    </>
  )
}
