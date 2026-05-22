import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import prescriptionService from '../../services/prescriptionService'
import adminService from '../../services/adminService'

const EMPTY_FORM = {
  patientId: '', appointmentId: '',
  diagnosis: '', medicines: '', instructions: '', followUpDate: '',
}

const MOCK_RX = [
  { id:1, patientName:'Rahul Verma',  diagnosis:'Hypertension', medicines:'Amlodipine 5mg', createdAt:'2026-05-10' },
  { id:2, patientName:'Anita Singh',  diagnosis:'Migraine',     medicines:'Sumatriptan 50mg', createdAt:'2026-05-12' },
]

export default function AddPrescription() {
  const { user } = useSelector((s) => s.auth)
  const [searchParams] = useSearchParams()

  // Pre-fill from URL: /doctor/prescription/new?patientId=3&appointmentId=7&patientName=Rahul
  const urlPatientId     = searchParams.get('patientId')     || ''
  const urlAppointmentId = searchParams.get('appointmentId') || ''
  const urlPatientName   = searchParams.get('patientName')   || ''

  const INITIAL_FORM = {
    patientId:     urlPatientId,
    appointmentId: urlAppointmentId,
    diagnosis: '', medicines: '', instructions: '', followUpDate: '',
  }

  const [prescriptions, setPrescriptions] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [patients,      setPatients]      = useState([])
  // Auto-open form if navigated from appointment
  const [showForm,      setShowForm]      = useState(!!urlPatientId)
  const [form,          setForm]          = useState(INITIAL_FORM)
  const [saving,        setSaving]        = useState(false)
  const [selected,      setSelected]      = useState(null)
  const [modal,         setModal]         = useState(null)
  const [page,          setPage]          = useState(0)
  const [totalPages,    setTotalPages]    = useState(1)
  const PAGE_SIZE = 10

  // Load doctor's own prescriptions
  const fetchRx = useCallback(() => {
    setLoading(true)
    prescriptionService.getMy({ page, size: PAGE_SIZE })
      .then(({ data }) => {
        const d = data?.data
        if (d?.content) { setPrescriptions(d.content); setTotalPages(d.totalPages || 1) }
        else if (Array.isArray(d)) { setPrescriptions(d); setTotalPages(1) }
        else { setPrescriptions(MOCK_RX); setTotalPages(1) }
      })
      .catch(() => { setPrescriptions(MOCK_RX); setTotalPages(1) })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { fetchRx() }, [fetchRx])

  // Load patients for dropdown
  useEffect(() => {
    adminService.getAllPatients({ page: 0, size: 100 })
      .then(({ data }) => setPatients(data?.data?.content || data?.data || []))
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.patientId || !form.medicines.trim()) {
      toast.error('Patient and medicines are required')
      return
    }
    setSaving(true)
    try {
      await prescriptionService.create({
        patientId:     Number(form.patientId),
        appointmentId: form.appointmentId ? Number(form.appointmentId) : undefined,
        diagnosis:     form.diagnosis     || undefined,
        medicines:     form.medicines,
        instructions:  form.instructions  || undefined,
        followUpDate:  form.followUpDate  || undefined,
      })
      toast.success('Prescription created successfully')
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchRx()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Prescriptions</h1>
          <p>Prescriptions you have written</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ New Prescription'}
        </button>
      </div>

      {/* New prescription form */}
      {showForm && (
        <div className="section-card" style={{ marginBottom: '1.5rem' }}>
          <div className="section-header">
            <span className="section-title">💊 Write Prescription</span>
            {urlAppointmentId && (
              <span style={{ fontSize:'0.78rem', color:'#a78bfa', background:'rgba(167,139,250,0.12)', padding:'0.2rem 0.6rem', borderRadius:'999px' }}>
                📅 Linked to Appointment #{urlAppointmentId}
              </span>
            )}
          </div>
          <div className="section-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Patient *</label>
                  {urlPatientId ? (
                    /* Pre-filled from appointment — show as read-only */
                    <div style={{ padding:'0.65rem 0.9rem', background:'#0f172a', border:'1px solid #334155', borderRadius:'8px', color:'#a5b4fc', fontSize:'0.9rem' }}>
                      {urlPatientName || `Patient #${urlPatientId}`}
                      <input type="hidden" name="patientId" value={form.patientId} />
                    </div>
                  ) : (
                    <select name="patientId" className="form-control" value={form.patientId} onChange={handleChange}>
                      <option value="">— Select patient —</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Follow-up Date</label>
                  <input type="date" name="followUpDate" className="form-control"
                    value={form.followUpDate} onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <input name="diagnosis" className="form-control" value={form.diagnosis}
                  onChange={handleChange} placeholder="e.g. Hypertension, Type 2 Diabetes" />
              </div>
              <div className="form-group">
                <label className="form-label">Medicines *</label>
                <textarea name="medicines" className="form-control" rows={4}
                  value={form.medicines} onChange={handleChange}
                  placeholder="e.g. Amlodipine 5mg – 1 tablet daily&#10;Metformin 500mg – 1 tablet twice daily"
                  style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <textarea name="instructions" className="form-control" rows={2}
                  value={form.instructions} onChange={handleChange}
                  placeholder="e.g. Take after meals. Avoid alcohol."
                  style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Saving…</> : 'Save Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescriptions table */}
      <div className="section-card">
        <div className="section-header">
          <span className="section-title">📋 My Prescriptions</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{prescriptions.length} total</span>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading…</span></div>
        ) : prescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <div className="empty-title">No prescriptions yet</div>
            <div className="empty-sub">Click "+ New Prescription" to write one</div>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>#</th><th>Patient</th><th>Diagnosis</th><th>Medicines</th><th>Follow-up</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {prescriptions.map((rx, i) => (
                    <tr key={rx.id}>
                      <td style={{ color:'#64748b' }}>{page * PAGE_SIZE + i + 1}</td>
                      <td style={{ fontWeight:600, color:'#e2e8f0' }}>{rx.patientName || '—'}</td>
                      <td style={{ color:'#94a3b8' }}>{rx.diagnosis || '—'}</td>
                      <td style={{ color:'#94a3b8', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {rx.medicines}
                      </td>
                      <td style={{ color:'#94a3b8' }}>{rx.followUpDate || '—'}</td>
                      <td style={{ color:'#64748b', fontSize:'0.82rem' }}>
                        {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm btn-icon" title="View"
                          onClick={() => { setSelected(rx); setModal('view') }}>👁</button>
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

      {/* View modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">💊 Prescription Details</span>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {[
                ['Patient',     selected.patientName || '—'],
                ['Diagnosis',   selected.diagnosis   || '—'],
                ['Follow-up',   selected.followUpDate || '—'],
                ['Written on',  selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN') : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #334155' }}>
                  <span style={{ color:'#64748b', fontSize:'0.85rem' }}>{k}</span>
                  <span style={{ color:'#e2e8f0', fontSize:'0.85rem', fontWeight:500 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:'1rem' }}>
                <div style={{ color:'#64748b', fontSize:'0.8rem', marginBottom:'0.4rem', textTransform:'uppercase', letterSpacing:'0.4px' }}>Medicines</div>
                <pre style={{ color:'#e2e8f0', fontSize:'0.875rem', whiteSpace:'pre-wrap', fontFamily:'inherit', lineHeight:1.6 }}>{selected.medicines}</pre>
              </div>
              {selected.instructions && (
                <div style={{ marginTop:'1rem' }}>
                  <div style={{ color:'#64748b', fontSize:'0.8rem', marginBottom:'0.4rem', textTransform:'uppercase', letterSpacing:'0.4px' }}>Instructions</div>
                  <p style={{ color:'#94a3b8', fontSize:'0.875rem', lineHeight:1.6 }}>{selected.instructions}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
