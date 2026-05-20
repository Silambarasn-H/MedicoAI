import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { updateUser } from '../../context/authSlice'
import api from '../../services/api'

const TABS = ['Profile', 'Security', 'System', 'Notifications']

export default function AdminSettings() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const [tab, setTab] = useState('Profile')
  const [saving, setSaving] = useState(false)

  /* Profile form */
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email:    user?.email    || '',
    phone:    user?.phone    || '',
  })

  /* Password form */
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })

  /* System settings */
  const [sysSettings, setSysSettings] = useState({
    hospitalName:    'MedicoAI Hospital',
    hospitalAddress: '123 Health Street, Mumbai, Maharashtra',
    contactEmail:    'contact@medicoai.com',
    contactPhone:    '+91 9000000000',
    appointmentSlot: '30',
    maxDailyAppts:   '20',
    currency:        'INR',
    timezone:        'Asia/Kolkata',
  })

  /* Notification prefs */
  const [notifPrefs, setNotifPrefs] = useState({
    emailOnNewAppt:    true,
    emailOnCancel:     true,
    emailOnPayment:    true,
    smsOnNewAppt:      false,
    reminderHoursBefore: '24',
  })

  const handleProfileSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/users/me', profile)
      dispatch(updateUser(data.data || profile))
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  const handlePasswordSave = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      await api.put('/users/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      })
      toast.success('Password changed successfully')
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed')
    } finally { setSaving(false) }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p>Manage your account and system preferences</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:'0.25rem', marginBottom:'1.5rem', borderBottom:'1px solid #334155', paddingBottom:'0' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background:'none', border:'none', cursor:'pointer',
              padding:'0.65rem 1.1rem',
              fontSize:'0.875rem', fontWeight:600,
              color: tab === t ? '#a5b4fc' : '#64748b',
              borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
              transition:'all 0.15s', fontFamily:'inherit',
              marginBottom:'-1px',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'Profile' && (
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">👤 Profile Information</span>
          </div>
          <div className="section-body">
            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2rem' }}>
              <div style={{
                width:80, height:80, borderRadius:'50%',
                background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.8rem', fontWeight:700, color:'#fff',
              }}>
                {(user?.fullName || 'A').charAt(0)}
              </div>
              <div>
                <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#f1f5f9' }}>{user?.fullName}</div>
                <div style={{ fontSize:'0.85rem', color:'#64748b' }}>{user?.email}</div>
                <span className="badge badge-purple" style={{ marginTop:'0.4rem' }}>Administrator</span>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={profile.fullName}
                  onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={profile.email}
                  onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={profile.phone}
                  onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleProfileSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Security tab */}
      {tab === 'Security' && (
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">🔒 Change Password</span>
          </div>
          <div className="section-body" style={{ maxWidth:480 }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-control" type="password" value={pwForm.currentPassword}
                onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter current password" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-control" type="password" value={pwForm.newPassword}
                onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min 8 chars, A-Z, 0-9, @$!" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-control" type="password" value={pwForm.confirmPassword}
                onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password" />
            </div>
            <button className="btn btn-primary" onClick={handlePasswordSave} disabled={saving}>
              {saving ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </div>
      )}

      {/* System tab */}
      {tab === 'System' && (
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">⚙️ System Configuration</span>
          </div>
          <div className="section-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hospital Name</label>
                <input className="form-control" value={sysSettings.hospitalName}
                  onChange={(e) => setSysSettings(p => ({ ...p, hospitalName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input className="form-control" type="email" value={sysSettings.contactEmail}
                  onChange={(e) => setSysSettings(p => ({ ...p, contactEmail: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hospital Address</label>
              <textarea className="form-control" rows={2} value={sysSettings.hospitalAddress}
                onChange={(e) => setSysSettings(p => ({ ...p, hospitalAddress: e.target.value }))}
                style={{ resize:'vertical' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Appointment Slot (minutes)</label>
                <select className="form-control" value={sysSettings.appointmentSlot}
                  onChange={(e) => setSysSettings(p => ({ ...p, appointmentSlot: e.target.value }))}>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Max Daily Appointments</label>
                <input className="form-control" type="number" value={sysSettings.maxDailyAppts}
                  onChange={(e) => setSysSettings(p => ({ ...p, maxDailyAppts: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-control" value={sysSettings.currency}
                  onChange={(e) => setSysSettings(p => ({ ...p, currency: e.target.value }))}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select className="form-control" value={sysSettings.timezone}
                  onChange={(e) => setSysSettings(p => ({ ...p, timezone: e.target.value }))}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => toast.success('System settings saved')}>
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'Notifications' && (
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">🔔 Notification Preferences</span>
          </div>
          <div className="section-body">
            {[
              { key:'emailOnNewAppt',  label:'Email on new appointment',    desc:'Send email when a new appointment is booked' },
              { key:'emailOnCancel',   label:'Email on cancellation',        desc:'Send email when an appointment is cancelled' },
              { key:'emailOnPayment',  label:'Email on payment received',    desc:'Send email when a payment is processed' },
              { key:'smsOnNewAppt',    label:'SMS on new appointment',       desc:'Send SMS notification for new bookings' },
            ].map(({ key, label, desc }) => (
              <div key={key} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'1rem 0', borderBottom:'1px solid #334155',
              }}>
                <div>
                  <div style={{ fontSize:'0.9rem', fontWeight:600, color:'#e2e8f0' }}>{label}</div>
                  <div style={{ fontSize:'0.8rem', color:'#64748b' }}>{desc}</div>
                </div>
                <button
                  onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                  style={{
                    width:44, height:24, borderRadius:999,
                    background: notifPrefs[key] ? '#6366f1' : '#334155',
                    border:'none', cursor:'pointer', position:'relative',
                    transition:'background 0.2s', flexShrink:0,
                  }}
                >
                  <span style={{
                    position:'absolute', top:3,
                    left: notifPrefs[key] ? 22 : 3,
                    width:18, height:18, borderRadius:'50%',
                    background:'#fff', transition:'left 0.2s',
                  }} />
                </button>
              </div>
            ))}
            <div style={{ marginTop:'1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Reminder Hours Before Appointment</label>
                <select className="form-control" style={{ width:200 }}
                  value={notifPrefs.reminderHoursBefore}
                  onChange={(e) => setNotifPrefs(p => ({ ...p, reminderHoursBefore: e.target.value }))}>
                  <option value="1">1 hour before</option>
                  <option value="2">2 hours before</option>
                  <option value="6">6 hours before</option>
                  <option value="12">12 hours before</option>
                  <option value="24">24 hours before</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => toast.success('Notification preferences saved')}>
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </>
  )
}
