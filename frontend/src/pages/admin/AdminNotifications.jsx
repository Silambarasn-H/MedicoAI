import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import adminService from '../../services/adminService'
import { setNotifications, markRead, markAllRead } from '../../context/notificationSlice'

const TYPE_META = {
  APPOINTMENT: { icon:'📅', color:'rgba(56,189,248,0.15)',  label:'Appointment' },
  PAYMENT:     { icon:'💳', color:'rgba(251,191,36,0.15)',  label:'Payment'     },
  PRESCRIPTION:{ icon:'💊', color:'rgba(167,139,250,0.15)', label:'Prescription'},
  SYSTEM:      { icon:'⚙️', color:'rgba(148,163,184,0.15)', label:'System'      },
  REMINDER:    { icon:'⏰', color:'rgba(74,222,128,0.15)',  label:'Reminder'    },
}

export default function AdminNotifications() {
  const dispatch = useDispatch()
  const { items: notifications } = useSelector((s) => s.notifications)
  const unread = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    adminService.getNotifications()
      .then(({ data }) => dispatch(setNotifications(data.data || [])))
      .catch(() => {})
  }, [dispatch])

  const handleMarkRead = async (id) => {
    try {
      await adminService.markRead(id)
      dispatch(markRead(id))
    } catch { toast.error('Failed to mark as read') }
  }

  const handleMarkAll = async () => {
    try {
      await adminService.markAllRead()
      dispatch(markAllRead())
      toast.success('All notifications marked as read')
    } catch { toast.error('Failed') }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Notifications</h1>
          <p>{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-ghost" onClick={handleMarkAll}>
            ✓ Mark all as read
          </button>
        )}
      </div>

      <div className="section-card">
        <div className="section-header">
          <span className="section-title">🔔 All Notifications</span>
          <span style={{ fontSize:'0.8rem', color:'#64748b' }}>{notifications.length} total</span>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">No notifications</div>
            <div className="empty-sub">You're all caught up!</div>
          </div>
        ) : (
          <div style={{ padding:'0.5rem 0' }}>
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.SYSTEM
              return (
                <div
                  key={n.id}
                  style={{
                    display:'flex', alignItems:'flex-start', gap:'1rem',
                    padding:'1rem 1.4rem',
                    borderBottom:'1px solid #334155',
                    background: !n.isRead ? 'rgba(99,102,241,0.04)' : 'transparent',
                    cursor: !n.isRead ? 'pointer' : 'default',
                    transition:'background 0.15s',
                  }}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                >
                  <div style={{
                    width:42, height:42, borderRadius:'50%',
                    background: meta.color,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.1rem', flexShrink:0,
                  }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.2rem' }}>
                      <span className={`badge ${
                        n.type === 'APPOINTMENT' ? 'badge-info'
                        : n.type === 'PAYMENT' ? 'badge-warning'
                        : n.type === 'PRESCRIPTION' ? 'badge-purple'
                        : 'badge-gray'
                      }`}>{meta.label}</span>
                      {!n.isRead && (
                        <span style={{
                          width:8, height:8, borderRadius:'50%',
                          background:'#6366f1', display:'inline-block',
                        }} />
                      )}
                    </div>
                    <div style={{ fontSize:'0.875rem', color:'#e2e8f0', lineHeight:1.5 }}>{n.message}</div>
                    <div style={{ fontSize:'0.75rem', color:'#64748b', marginTop:'0.25rem' }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : ''}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id) }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
