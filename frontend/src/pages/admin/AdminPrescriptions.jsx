import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import adminService from '../../services/adminService'

const MOCK = [
  { id:1, patientName:'Rahul Verma',  doctorName:'Dr. Priya Sharma', diagnosis:'Hypertension',
    medicines:'Amlodipine 5mg – 1 tablet daily', createdAt:'2026-05-10' },
  { id:2, patientName:'Anita Singh',  doctorName:'Dr. Arjun Mehta',  diagnosis:'Migraine',
    medicines:'Sumatriptan 50mg – as needed',    createdAt:'2026-05-12' },
  { id:3, patientName:'Karan Patel',  doctorName:'Dr. Sunita Rao',   diagnosis:'Type 2 Diabetes',
    medicines:'Metformin 500mg – twice daily',   createdAt:'2026-05-14' },
]

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [page,          setPage]          = useState(0)
  const [totalPages,    setTotalPages]    = useState(1)
  const [selected,      setSelected]      = useState(null)
  const [deleting,      setDeleting]      = useState(false)
  const [confirmId,     setConfirmId]     = useState(null)
  const PAGE_SIZE = 10

  const fetchRx = useCallback(() => {
    setLoading(true)
    adminService.getAllPrescriptions({
      page, size: PAGE_SIZE,
      search: search.trim() || undefined,
      sortBy: 'createdAt', sortDir: 'desc',
    })
      .then(({ data }) => {
        const d = data?.data
        if (d?.content) { setPrescriptions(d.content); setTotalPages(d.totalPages || 1) }
        else if (Array.isArray(d)) { setPrescriptions(d); setTotalPages(1) }
        else { setPrescriptions(MOCK); setTotalPages(1) }
      })
      .catch(() => { setPrescriptions(MOCK); setTotalPages(1) })
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { fetchRx() }, [fetchRx])

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await adminService.deletePrescription(id)
      toast.success('Prescription deleted')
      setConfirmId(null)
      fetchRx()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally { setDeleting(false) }
  }

  const filtered = prescriptions.filter((rx) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (rx.patientName || '').toLowerCase().includes(q) ||
      (rx.doctorName  || '').toLowerCase().includes(q) ||
      (rx.diagnosis   || '').toLowerCase().includes(q)
    )
  })

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Prescriptions</h1>
          <p>All prescriptions across the system</p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <span className="section-title">💊 All Prescriptions</span>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search patient, doctor or diagnosis…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading…</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <div className="empty-title">No prescriptions found</div>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Patient</th><th>Doctor</th>
                    <th>Diagnosis</th><th>Medicines</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rx, i) => (
                    <tr key={rx.id}>
                      <td style={{ color:'#64748b' }}>{page * PAGE_SIZE + i + 1}</td>
                      <td style={{ fontWeight:600, color:'#e2e8f0' }}>
                        {rx.patientName || '—'}
                        {rx.appointmentId && (
                          <div style={{ fontSize:'0.7rem', color:'#a78bfa', marginTop:'0.15rem' }}>
                            📅 Appt #{rx.appointmentId}
                            {rx.appointmentDate ? ` · ${rx.appointmentDate}` : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ color:'#94a3b8' }}>{rx.doctorName || '—'}</td>
                      <td style={{ color:'#94a3b8' }}>{rx.diagnosis || '—'}</td>
                      <td style={{ color:'#94a3b8', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {rx.medicines}
                      </td>
                      <td style={{ color:'#64748b', fontSize:'0.82rem' }}>
                        {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" title="View"
                            onClick={() => setSelected(rx)}>👁</button>
                          <button className="btn btn-danger btn-sm btn-icon" title="Delete"
                            onClick={() => setConfirmId(rx.id)}>🗑</button>
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

      {/* View modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">💊 Prescription Details</span>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              {[
                ['Patient',      selected.patientName  || '—'],
                ['Doctor',       selected.doctorName   || '—'],
                ['Specialization', selected.specialization || '—'],
                ['Diagnosis',    selected.diagnosis    || '—'],
                ['Follow-up',    selected.followUpDate || '—'],
                ...(selected.appointmentId ? [
                  ['Appointment ID',     `#${selected.appointmentId}`],
                  ['Appointment Date',   selected.appointmentDate   || '—'],
                  ['Appointment Reason', selected.appointmentReason || '—'],
                ] : []),
                ['Written on',   selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN') : '—'],
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
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmId && (
        <div className="modal-overlay" onClick={() => setConfirmId(null)}>
          <div className="modal" style={{ maxWidth:400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-dialog">
                <div className="confirm-icon">🗑️</div>
                <div className="confirm-title">Delete Prescription?</div>
                <div className="confirm-msg">This action cannot be undone.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmId)} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
