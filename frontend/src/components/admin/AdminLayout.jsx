import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import adminService from '../../services/adminService'
import { setNotifications, markAllRead } from '../../context/notificationSlice'
import './admin.css'

const PAGE_TITLES = {
  '/admin':               { title: 'Dashboard',     sub: 'Overview & analytics' },
  '/admin/doctors':       { title: 'Doctors',        sub: 'Manage doctor accounts' },
  '/admin/patients':      { title: 'Patients',       sub: 'Manage patient records' },
  '/admin/appointments':  { title: 'Appointments',   sub: 'All appointment records' },
  '/admin/reports':       { title: 'Reports',        sub: 'Analytics & revenue' },
  '/admin/notifications': { title: 'Notifications',  sub: 'System alerts' },
  '/admin/settings':      { title: 'Settings',       sub: 'System configuration' },
}

export default function AdminLayout() {
  const location   = useLocation()
  const dispatch   = useDispatch()
  const { items: notifications } = useSelector((s) => s.notifications)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const notifRef = useRef(null)

  const meta = PAGE_TITLES[location.pathname] || { title: 'Admin', sub: '' }

  /* Load notifications on mount */
  useEffect(() => {
    adminService.getNotifications()
      .then(({ data }) => dispatch(setNotifications(data.data || [])))
      .catch(() => {})
  }, [dispatch])

  /* Close notif panel on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkAllRead = () => {
    adminService.markAllRead().catch(() => {})
    dispatch(markAllRead())
  }

  return (
    <div className="admin-layout">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      <div className={`admin-main${sidebarOpen ? '' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <button
            className="topbar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <div>
            <div className="topbar-title">{meta.title}</div>
            {meta.sub && <div className="topbar-breadcrumb">{meta.sub}</div>}
          </div>

          <div className="topbar-actions">
            {/* Notifications */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="topbar-btn"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
              >
                🔔
                {unreadCount > 0 && <span className="topbar-notif-dot" />}
              </button>

              {notifOpen && (
                <div className="notif-panel">
                  <div className="notif-header">
                    <span className="notif-title">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleMarkAllRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">No notifications</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item${!n.isRead ? ' unread' : ''}`}
                        >
                          <span className="notif-icon">
                            {n.type === 'APPOINTMENT' ? '📅'
                              : n.type === 'PAYMENT' ? '💳'
                              : n.type === 'PRESCRIPTION' ? '💊'
                              : '🔔'}
                          </span>
                          <div className="notif-content">
                            <div className="notif-msg">{n.message}</div>
                            <div className="notif-time">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </div>
                          {!n.isRead && <div className="notif-unread-dot" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme placeholder */}
            <button className="topbar-btn" title="Toggle theme">🌙</button>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
