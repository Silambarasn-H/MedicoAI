import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import appointmentService from '../../services/appointmentService'

const STATUS_BADGE = {
  PENDING:     'badge-warning',
  CONFIRMED:   'badge-info',
  COMPLETED:   'badge-success',
  CANCELLED:   'badge-danger',
  RESCHEDULED: 'badge-purple',
}
const STATUSES = ['ALL','PENDING','CONFIRMED','COMPLETED','CANCELLED','RESCHEDULED']

const MOCK = [
  { id:1, patientName:'Rahul Verma',  patientId:1, appointmentDate:'2026-05-20', appointmentTime:'10:00', status:'COMPLETED',  type:'IN_PERSON', reason:'Chest pain'  },
  { id:2, patientName:'Anita Singh',  patientId:2, appointmentDate:'2026-05-21', appointmentTime:'11:30', status:'CONFIRMED',  type:'ONLINE',    reason:'Headache'    },
  { id:3, patientName:'Karan Patel',  patientId:3, appointmentDate:'2026-05-22', appointmentTime:'14:00', status:'PENDING',    type:'IN_PERSON', reason:'Fever'       },
]

export default function DoctorAppointments() {
  const navigate = useNavigate()

  const [appts,        setAppts]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page,         setPage]         = useState(0)
  const [totalPages,   setTotalPages]   = useState(1)
  const [saving,       setSaving]       = useState(false)
  const PAGE_SIZE = 10

  const fetchAppts = useCallback(() => {
    setLoading(true)
    const params = { page, size: PAGE_SIZE, sortBy: 'createdAt', sortDir: 'desc' }
    if (statusFilter !== 'ALL') params.status = statusFilter

    appointmentService.getAll(params)
      .then(({ data }) => {
        const d = data?.data
        if (d?.content) { setAppts(d.content); setTotalPages(d.totalPages || 1) }
        else if (Array.isArray(d)) { setAppts(d); setTotalPages(1) }
        else { setAppts(MOCK); setTotalPages(1) }
      })
      .catch(() => { setAppts(MOCK); setTotalPages(1) })
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  useEffect(() => { fetchAppts() }, [fetchAppts])

  const handleComplete = async (appt) => {
    setSaving(true)
    try {
      await appointmentService.complete(appt.id)
      toast.success('Appointment marked as completed')
      fetchAppts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete')
    } finally { setSaving(false) }
  }

  const handleConfirm = async (appt) => {
    setSaving(true)
    try {
      await appointmentService.confirm(appt.id)
      toast.success('Appointment confirmed')
      fetchAppts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm')
    } finally { setSaving(false) }
  }

  // Navigate to AddPrescription with pre-filled patientId and appointmentId
  const handleAddPrescription = (appt) => {
    navigate(
      `/doctor/prescription/new?patientId=${appt.patientId}&appointmentId=${appt.id}&patientName=${encodeURIComponent(appt.patientName || '')}`
    )
  }

  const filtered = appts.filter(a =>
    statusFilter === 'ALL' || a.status === statusFilter
  )

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Appointments</h1>
          <p>{appts.length} appointment{appts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {STATUSES.map(s => (
          <button key={s}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setStatusFilter(s); setPage(0) }}>
            {s}
          </button>
        ))}
      </div>

      <div className="section-card">
        <div className="section-header">
          <span className="section-title">📅 Appointments</span>
          <span style={{ fontSize:'0.8rem', color:'#64748b' }}>
            💊 = Write prescription for completed appointments
          </span>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading…</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No appointments found</div>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Patient</th><th>Date</th><th>Time</th>
                    <th>Type</th><th>Reason</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id}>
                      <td style={{ color:'#64748b' }}>{page * PAGE_SIZE + i + 1}</td>
                      <td style={{ fontWeight:600, color:'#e2e8f0' }}>{a.patientName || '—'}</td>
                      <td style={{ color:'#94a3b8', whiteSpace:'nowrap' }}>{a.appointmentDate}</td>
                      <td style={{ color:'#94a3b8', whiteSpace:'nowrap' }}>{a.appointmentTime}</td>
                      <td>
                        <span className={`badge ${a.type === 'ONLINE' ? 'badge-purple' : 'badge-gray'}`}>
                          {a.type === 'ONLINE' ? '🌐' : '🏥'} {a.type}
                        </span>
                      </td>
                      <td style={{ color:'#94a3b8', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {a.reason || '—'}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[a.status] || 'badge-gray'}`}>{a.status}</span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          {/* Confirm PENDING/RESCHEDULED */}
                          {(a.status === 'PENDING' || a.status === 'RESCHEDULED') && (
                            <button className="btn btn-success btn-sm btn-icon" title="Confirm"
                              onClick={() => handleConfirm(a)} disabled={saving}>✓</button>
                          )}
                          {/* Complete CONFIRMED */}
                          {a.status === 'CONFIRMED' && (
                            <button className="btn btn-primary btn-sm btn-icon" title="Mark complete"
                              onClick={() => handleComplete(a)} disabled={saving}>✔</button>
                          )}
                          {/* Add Prescription — only for COMPLETED */}
                          {a.status === 'COMPLETED' && (
                            <button
                              className="btn btn-sm"
                              title="Write prescription"
                              onClick={() => handleAddPrescription(a)}
                              style={{ background:'rgba(167,139,250,0.15)', color:'#a78bfa', border:'1px solid rgba(167,139,250,0.3)', fontSize:'0.78rem', padding:'0.35rem 0.6rem' }}
                            >
                              💊 Rx
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span className="page-info">Page {page + 1} of {totalPages}</span>
              <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i} className={`page-btn${page === i ? ' active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
              ))}
              <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
