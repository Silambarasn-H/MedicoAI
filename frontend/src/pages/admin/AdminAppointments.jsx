import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import appointmentService from '../../services/appointmentService'
import adminService from '../../services/adminService'

const EMPTY_FORM = {
  patientId: '', doctorId: '',
  appointmentDate: '', appointmentTime: '',
  type: 'IN_PERSON', reason: '', notes: '',
}

const STATUS_BADGE = {
  PENDING:     'badge-warning',
  CONFIRMED:   'badge-info',
  COMPLETED:   'badge-success',
  CANCELLED:   'badge-danger',
  RESCHEDULED: 'badge-purple',
}

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']

const MOCK = [
  { id:1, patientName:'Rahul Verma',  doctorName:'Dr. Priya Sharma', appointmentDate:'2026-05-20', appointmentTime:'10:00', status:'CONFIRMED',  type:'IN_PERSON', reason:'Chest pain'  },
  { id:2, patientName:'Anita Singh',  doctorName:'Dr. Arjun Mehta',  appointmentDate:'2026-05-20', appointmentTime:'11:30', status:'PENDING',    type:'ONLINE',    reason:'Headache'    },
  { id:3, patientName:'Karan Patel',  doctorName:'Dr. Sunita Rao',   appointmentDate:'2026-05-21', appointmentTime:'14:00', status:'COMPLETED',  type:'IN_PERSON', reason:'Fever'       },
  { id:4, patientName:'Meena Joshi',  doctorName:'Dr. Priya Sharma', appointmentDate:'2026-05-21', appointmentTime:'15:30', status:'CANCELLED',  type:'IN_PERSON', reason:'Back pain'   },
  { id:5, patientName:'Suresh Kumar', doctorName:'Dr. Arjun Mehta',  appointmentDate:'2026-05-22', appointmentTime:'09:00', status:'RESCHEDULED',type:'ONLINE',    reason:'Follow-up'   },
]

export default function AdminAppointments() {
  const [appts,        setAppts]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page,         setPage]         = useState(0)
  const [totalPages,   setTotalPages]   = useState(1)
  const PAGE_SIZE = 10

  // Book modal state
  const [showBook, setShowBook] = useState(false)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [saving,   setSaving]   = useState(false)
  const [doctors,  setDoctors]  = useState([])
  const [patients, setPatients] = useState([])

  // Load doctors + patients for selectors (once)
  useEffect(() => {
    adminService.getAllDoctors({ page: 0, size: 100 })
      .then(({ data }) => setDoctors(data?.data?.content || data?.data || []))
      .catch(() => {})
    adminService.getAllPatients({ page: 0, size: 100 })
      .then(({ data }) => setPatients(data?.data?.content || data?.data || []))
      .catch(() => {})
  }, [])

  const openBook  = () => { setForm(EMPTY_FORM); setShowBook(true) }
  const closeBook = () => { setShowBook(false) }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleBook = async () => {
    if (!form.doctorId || !form.patientId || !form.appointmentDate || !form.appointmentTime) {
      toast.error('Doctor, patient, date and time are required')
      return
    }
    setSaving(true)
    try {
      await appointmentService.book({
        doctorId:        Number(form.doctorId),
        patientId:       Number(form.patientId),
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        type:            form.type,
        reason:          form.reason  || undefined,
        notes:           form.notes   || undefined,
      })
      toast.success('Appointment booked successfully')
      closeBook()
      fetchAppts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setSaving(false)
    }
  }

  // ── Action modal state ──
  const [selected,       setSelected]       = useState(null)
  const [modal,          setModal]          = useState(null) // 'view'|'cancel'|'reschedule'
  const [cancelReason,   setCancelReason]   = useState('')
  const [rescheduleForm, setRescheduleForm] = useState({ newDate:'', newTime:'' })
  const closeModal = () => { setModal(null); setSelected(null); setCancelReason(''); setRescheduleForm({ newDate:'', newTime:'' }) }

  const doAction = async (label, apiFn) => {
    setSaving(true)
    try {
      await apiFn()
      toast.success(`${label} successfully`)
      closeModal()
      fetchAppts()
    } catch (err) {
      toast.error(err.response?.data?.message || `${label} failed`)
    } finally { setSaving(false) }
  }

  const handleConfirm   = (a) => doAction('Appointment confirmed',  () => appointmentService.confirm(a.id))
  const handleComplete  = (a) => doAction('Appointment completed',  () => appointmentService.complete(a.id))
  const handleCancel    = ()  => {
    if (!cancelReason.trim()) { toast.error('Please enter a cancellation reason'); return }
    doAction('Appointment cancelled', () => appointmentService.cancel(selected.id, cancelReason))
  }
  const handleReschedule = () => {
    if (!rescheduleForm.newDate || !rescheduleForm.newTime) { toast.error('New date and time are required'); return }
    doAction('Appointment rescheduled', () =>
      appointmentService.reschedule(selected.id, rescheduleForm.newDate, rescheduleForm.newTime))
  }

  const fetchAppts = useCallback(() => {
    setLoading(true)
    const params = { page, size: PAGE_SIZE, sortBy: 'createdAt', sortDir: 'desc' }
    if (statusFilter !== 'ALL') params.status = statusFilter
    if (search.trim())          params.search = search.trim()

    appointmentService.getAll(params)
      .then(({ data }) => {
        const d = data?.data
        if (d?.content)        { setAppts(d.content); setTotalPages(d.totalPages || 1) }
        else if (Array.isArray(d)) { setAppts(d);     setTotalPages(1) }
        else                   { setAppts(MOCK);      setTotalPages(1) }
      })
      .catch(() => { setAppts(MOCK); setTotalPages(1) })
      .finally(() => setLoading(false))
  }, [page, statusFilter, search])

  useEffect(() => { fetchAppts() }, [fetchAppts])

  // Derive display list: apply status tab + text search on top of fetched data
  const filteredAppointments = appts.filter((a) => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter
    const q = search.trim().toLowerCase()
    const matchesSearch = q === ''
      || (a.patientName || '').toLowerCase().includes(q)
      || (a.doctorName  || '').toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })
  // alias kept so existing JSX (filtered.map, filtered.length) still works
  const filtered = filteredAppointments

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Appointments</h1>
          <p>{appts.length} appointment{appts.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={openBook}
        >
          + Book Appointment
        </button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setStatusFilter(s); setPage(0) }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="section-card">
        <div className="section-header">
          <span className="section-title">📅 All Appointments</span>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search patient or doctor…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading appointments…</span>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No appointments found</div>
            <div className="empty-sub">
              {statusFilter !== 'ALL'
                ? `No ${statusFilter.toLowerCase()} appointments`
                : 'Book the first appointment using the button above'}
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id}>
                      <td style={{ color:'#64748b' }}>{page * PAGE_SIZE + i + 1}</td>

                      {/* Patient */}
                      <td style={{ fontWeight:600, color:'#e2e8f0' }}>{a.patientName}</td>
                      {/* Doctor */}
                      <td style={{ color:'#94a3b8' }}>{a.doctorName}</td>
                      <td style={{ color:'#94a3b8', whiteSpace:'nowrap' }}>{a.appointmentDate}</td>
                      <td style={{ color:'#94a3b8', whiteSpace:'nowrap' }}>{a.appointmentTime}</td>
                      <td>
                        <span className={`badge ${a.type === 'ONLINE' ? 'badge-purple' : 'badge-gray'}`}>
                          {a.type === 'ONLINE' ? '🌐 Online' : '🏥 In-Person'}
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
                          {/* View */}
                          <button className="btn btn-ghost btn-sm btn-icon" title="View details"
                            onClick={() => { setSelected(a); setModal('view') }}>👁</button>
                          {/* Confirm — only for PENDING / RESCHEDULED */}
                          {(a.status === 'PENDING' || a.status === 'RESCHEDULED') && (
                            <button className="btn btn-success btn-sm btn-icon" title="Confirm"
                              onClick={() => handleConfirm(a)} disabled={saving}>✓</button>
                          )}
                          {/* Complete — only for CONFIRMED */}
                          {a.status === 'CONFIRMED' && (
                            <button className="btn btn-primary btn-sm btn-icon" title="Mark complete"
                              onClick={() => handleComplete(a)} disabled={saving}>✔</button>
                          )}
                          {/* Reschedule — not cancelled/completed */}
                          {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                            <button className="btn btn-ghost btn-sm btn-icon" title="Reschedule"
                              onClick={() => { setSelected(a); setModal('reschedule') }}>📆</button>
                          )}
                          {/* Cancel — not already cancelled/completed */}
                          {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                            <button className="btn btn-danger btn-sm btn-icon" title="Cancel"
                              onClick={() => { setSelected(a); setModal('cancel') }}>✕</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <span className="page-info">Page {page + 1} of {totalPages}</span>
              <button className="page-btn" disabled={page === 0}
                onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={i}
                  className={`page-btn${page === i ? ' active' : ''}`}
                  onClick={() => setPage(i)}
                >{i + 1}</button>
              ))}
              <button className="page-btn" disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </>
        )}
      </div>

      {/* ── View Modal ── */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">📅 Appointment Details</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {/* Status badge */}
              <div style={{ textAlign:'center', marginBottom:'1.25rem' }}>
                <span className={`badge ${STATUS_BADGE[selected.status] || 'badge-gray'}`}
                  style={{ fontSize:'0.85rem', padding:'0.35rem 1rem' }}>
                  {selected.status}
                </span>
              </div>
              {[
                ['Patient',      selected.patientName],
                ['Patient Email',selected.patientEmail || '—'],
                ['Doctor',       selected.doctorName],
                ['Specialization',selected.specialization || '—'],
                ['Date',         selected.appointmentDate],
                ['Time',         selected.appointmentTime],
                ['Type',         selected.type === 'ONLINE' ? '🌐 Online' : '🏥 In-Person'],
                ['Reason',       selected.reason || '—'],
                ['Notes',        selected.notes  || '—'],
                ['Cancellation', selected.cancellationReason || '—'],
                ['Booked on',    selected.createdAt ? new Date(selected.createdAt).toLocaleString('en-IN') : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #334155' }}>
                  <span style={{ color:'#64748b', fontSize:'0.82rem', flexShrink:0, marginRight:'1rem' }}>{k}</span>
                  <span style={{ color:'#e2e8f0', fontSize:'0.82rem', fontWeight:500, textAlign:'right' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Close</button>
              {(selected.status === 'PENDING' || selected.status === 'RESCHEDULED') && (
                <button className="btn btn-success" onClick={() => { closeModal(); handleConfirm(selected) }} disabled={saving}>
                  ✓ Confirm
                </button>
              )}
              {selected.status === 'CONFIRMED' && (
                <button className="btn btn-primary" onClick={() => { closeModal(); handleComplete(selected) }} disabled={saving}>
                  ✔ Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {modal === 'cancel' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth:420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">✕ Cancel Appointment</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color:'#94a3b8', fontSize:'0.875rem', marginBottom:'1rem' }}>
                Cancelling appointment for <strong style={{ color:'#f1f5f9' }}>{selected.patientName}</strong> with{' '}
                <strong style={{ color:'#f1f5f9' }}>{selected.doctorName}</strong> on {selected.appointmentDate}.
              </p>
              <div className="form-group">
                <label className="form-label">Cancellation Reason *</label>
                <textarea
                  className="form-control" rows={3}
                  placeholder="Enter reason for cancellation…"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  style={{ resize:'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>Keep</button>
              <button className="btn btn-danger" onClick={handleCancel} disabled={saving}>
                {saving ? <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Cancelling…</> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reschedule Modal ── */}
      {modal === 'reschedule' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth:420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">📆 Reschedule Appointment</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color:'#94a3b8', fontSize:'0.875rem', marginBottom:'1rem' }}>
                Current: <strong style={{ color:'#f1f5f9' }}>{selected.appointmentDate}</strong> at{' '}
                <strong style={{ color:'#f1f5f9' }}>{selected.appointmentTime}</strong>
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Date *</label>
                  <input type="date" className="form-control"
                    value={rescheduleForm.newDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setRescheduleForm(p => ({ ...p, newDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Time *</label>
                  <input type="time" className="form-control"
                    value={rescheduleForm.newTime}
                    onChange={e => setRescheduleForm(p => ({ ...p, newTime: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReschedule} disabled={saving}>
                {saving ? <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Saving…</> : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Book Appointment Modal ── */}
      {showBook && (
        <div className="modal-overlay" onClick={closeBook}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="modal-header">
              <span className="modal-title">📅 Book Appointment</span>
              <button className="modal-close" onClick={closeBook}>✕</button>
            </div>

            {/* Body */}
            <div className="modal-body">

              {/* Patient */}
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select
                  name="patientId"
                  className="form-control"
                  value={form.patientId}
                  onChange={handleFormChange}
                >
                  <option value="">— Select patient —</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} {p.email ? `(${p.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div className="form-group">
                <label className="form-label">Doctor *</label>
                <select
                  name="doctorId"
                  className="form-control"
                  value={form.doctorId}
                  onChange={handleFormChange}
                >
                  <option value="">— Select doctor —</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} {d.specialization ? `— ${d.specialization}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date + Time */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    name="appointmentDate"
                    className="form-control"
                    value={form.appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input
                    type="time"
                    name="appointmentTime"
                    className="form-control"
                    value={form.appointmentTime}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              {/* Type */}
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  name="type"
                  className="form-control"
                  value={form.type}
                  onChange={handleFormChange}
                >
                  <option value="IN_PERSON">🏥 In-Person</option>
                  <option value="ONLINE">🌐 Online</option>
                </select>
              </div>

              {/* Reason */}
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea
                  name="reason"
                  className="form-control"
                  rows={3}
                  placeholder="Describe the reason for the appointment…"
                  value={form.reason}
                  onChange={handleFormChange}
                  style={{ resize: 'vertical' }}
                />
              </div>

            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeBook} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleBook} disabled={saving}>
                {saving ? (
                  <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Booking…</>
                ) : 'Book Appointment'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
