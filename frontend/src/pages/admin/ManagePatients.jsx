import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import adminService from '../../services/adminService'
import authService from '../../services/authService'

const EMPTY_PATIENT = {
  fullName: '', email: '', password: 'Patient@1234',
  phone: '', gender: '', bloodGroup: '', address: '',
}

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

const MOCK_PATIENTS = [
  { id:1, fullName:'Rahul Verma',   email:'rahul@example.com',  phone:'9876543210', gender:'MALE',   bloodGroup:'O+', createdAt:'2026-01-10', isActive:true  },
  { id:2, fullName:'Anita Singh',   email:'anita@example.com',  phone:'9876543211', gender:'FEMALE', bloodGroup:'A+', createdAt:'2026-02-14', isActive:true  },
  { id:3, fullName:'Karan Patel',   email:'karan@example.com',  phone:'9876543212', gender:'MALE',   bloodGroup:'B+', createdAt:'2026-03-05', isActive:false },
  { id:4, fullName:'Meena Joshi',   email:'meena@example.com',  phone:'9876543213', gender:'FEMALE', bloodGroup:'AB+',createdAt:'2026-03-22', isActive:true  },
  { id:5, fullName:'Suresh Kumar',  email:'suresh@example.com', phone:'9876543214', gender:'MALE',   bloodGroup:'O-', createdAt:'2026-04-01', isActive:true  },
  { id:6, fullName:'Priya Nair',    email:'priya@example.com',  phone:'9876543215', gender:'FEMALE', bloodGroup:'A-', createdAt:'2026-04-18', isActive:true  },
]

export default function ManagePatients() {
  const [patients,   setPatients]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [modal,      setModal]      = useState(null)
  const [selected,   setSelected]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [genderFilter, setGenderFilter] = useState('')

  const PAGE_SIZE = 8

  const fetchPatients = useCallback(() => {
    setLoading(true)
    adminService.getAllPatients({ page, size: PAGE_SIZE, search, gender: genderFilter || undefined })
      .then(({ data }) => {
        const d = data?.data
        if (d?.content) { setPatients(d.content); setTotalPages(d.totalPages || 1) }
        else if (Array.isArray(d)) { setPatients(d); setTotalPages(1) }
        else { setPatients(MOCK_PATIENTS); setTotalPages(1) }
      })
      .catch(() => { setPatients(MOCK_PATIENTS); setTotalPages(1) })
      .finally(() => setLoading(false))
  }, [page, search, genderFilter])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  const openView   = (p) => { setSelected(p); setModal('view') }
  const openDelete = (p) => { setSelected(p); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null) }

  // ── Add patient ──
  const [addForm, setAddForm] = useState(EMPTY_PATIENT)
  const handleAddChange = (e) => {
    const { name, value } = e.target
    setAddForm(p => ({ ...p, [name]: value }))
  }
  const handleAdd = async () => {
    if (!addForm.fullName.trim() || !addForm.email.trim()) {
      toast.error('Full name and email are required')
      return
    }
    setSaving(true)
    try {
      // Step 1: register user with PATIENT role
      const { data: reg } = await authService.register({
        fullName: addForm.fullName.trim(),
        email:    addForm.email.trim().toLowerCase(),
        password: addForm.password || 'Patient@1234',
        phone:    addForm.phone    || undefined,
        role:     'PATIENT',
      })
      const newUserId = reg?.data?.userId
      if (!newUserId) throw new Error('Registration did not return a userId')

      // Step 2: create patient profile
      await adminService.createPatient({
        userId:     newUserId,
        gender:     addForm.gender     || undefined,
        bloodGroup: addForm.bloodGroup || undefined,
        address:    addForm.address    || undefined,
      })
      toast.success('Patient added successfully')
      setModal(null)
      setAddForm(EMPTY_PATIENT)
      fetchPatients()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add patient')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (patient) => {
    try {
      await adminService.toggleUserStatus(patient.userId || patient.id, !patient.isActive)
      toast.success(`Patient ${patient.isActive ? 'deactivated' : 'activated'}`)
      fetchPatients()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await adminService.deletePatient(selected.id)
      toast.success('Patient removed')
      closeModal(); fetchPatients()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally { setSaving(false) }
  }

  // Derive display list: apply gender dropdown + text search on top of fetched data
  const filteredPatients = patients.filter((p) => {
    const g = p.gender || p.user?.gender || ''
    const matchesGender = genderFilter === '' || g === genderFilter
    const q = search.trim().toLowerCase()
    const name  = (p.fullName || p.user?.fullName || '').toLowerCase()
    const email = (p.email    || p.user?.email    || '').toLowerCase()
    const matchesSearch = q === '' || name.includes(q) || email.includes(q)
    return matchesGender && matchesSearch
  })
  // alias kept so existing JSX (filtered.map, filtered.length) still works
  const filtered = filteredPatients

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Patients</h1>
          <p>{patients.length} patients registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setAddForm(EMPTY_PATIENT); setModal('add') }}>
          + Add Patient
        </button>
      </div>

      <div className="section-card">
        <div className="section-header">
          <span className="section-title">🧑‍🤝‍🧑 All Patients</span>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
            <select
              className="form-control"
              style={{ width:140, height:38 }}
              value={genderFilter}
              onChange={(e) => { setGenderFilter(e.target.value); setPage(0) }}
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search patients…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading patients…</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧑‍🤝‍🧑</div>
            <div className="empty-title">No patients found</div>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Patient</th><th>Phone</th>
                    <th>Gender</th><th>Blood Group</th>
                    <th>Registered</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id}>
                      <td style={{ color:'#64748b' }}>{page * PAGE_SIZE + i + 1}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                          <div style={{
                            width:34, height:34, borderRadius:'50%',
                            background:'linear-gradient(135deg,#38bdf8,#6366f1)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:'0.75rem', fontWeight:700, color:'#fff', flexShrink:0,
                          }}>
                            {(p.fullName || p.user?.fullName || 'P').charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, color:'#e2e8f0' }}>{p.fullName || p.user?.fullName}</div>
                            <div style={{ fontSize:'0.75rem', color:'#64748b' }}>{p.email || p.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color:'#94a3b8' }}>{p.phone || p.user?.phone || '—'}</td>
                      <td>
                        <span className={`badge ${p.gender === 'MALE' ? 'badge-info' : p.gender === 'FEMALE' ? 'badge-purple' : 'badge-gray'}`}>
                          {p.gender || '—'}
                        </span>
                      </td>
                      <td>
                        {p.bloodGroup
                          ? <span className="badge badge-danger">{p.bloodGroup}</span>
                          : '—'}
                      </td>
                      <td style={{ color:'#94a3b8', fontSize:'0.82rem' }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openView(p)} title="View">👁</button>
                          <button
                            className={`btn btn-sm btn-icon ${p.isActive ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleToggleStatus(p)}
                            title={p.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {p.isActive ? '🚫' : '✅'}
                          </button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(p)} title="Delete">🗑</button>
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

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">👁 Patient Details</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
                <div style={{
                  width:72, height:72, borderRadius:'50%',
                  background:'linear-gradient(135deg,#38bdf8,#6366f1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.5rem', fontWeight:700, color:'#fff', margin:'0 auto 0.75rem',
                }}>
                  {(selected.fullName || 'P').charAt(0)}
                </div>
                <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#f1f5f9' }}>{selected.fullName}</div>
                <span className={`badge ${selected.isActive ? 'badge-success' : 'badge-danger'}`} style={{ marginTop:'0.4rem' }}>
                  {selected.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {[
                ['Email',       selected.email || '—'],
                ['Phone',       selected.phone || '—'],
                ['Gender',      selected.gender || '—'],
                ['Blood Group', selected.bloodGroup || '—'],
                ['Date of Birth', selected.dateOfBirth || '—'],
                ['Address',     selected.address || '—'],
                ['Emergency Contact', selected.emergencyContact || '—'],
                ['Allergies',   selected.allergies || '—'],
                ['Chronic Diseases', selected.chronicDiseases || '—'],
                ['Registered',  selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN') : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #334155' }}>
                  <span style={{ color:'#64748b', fontSize:'0.85rem' }}>{k}</span>
                  <span style={{ color:'#e2e8f0', fontSize:'0.85rem', fontWeight:500, textAlign:'right', maxWidth:'60%' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {modal === 'delete' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth:400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-dialog">
                <div className="confirm-icon">🗑️</div>
                <div className="confirm-title">Remove Patient?</div>
                <div className="confirm-msg">
                  Remove <strong style={{ color:'#f1f5f9' }}>{selected.fullName}</strong>? This cannot be undone.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Patient Modal ── */}
      {modal === 'add' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth:500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">➕ Add Patient</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">

              {/* Full Name + Email */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input name="fullName" className="form-control"
                    value={addForm.fullName} onChange={handleAddChange}
                    placeholder="Rahul Verma" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input name="email" type="email" className="form-control"
                    value={addForm.email} onChange={handleAddChange}
                    placeholder="patient@example.com" />
                </div>
              </div>

              {/* Phone + Gender */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input name="phone" className="form-control"
                    value={addForm.phone} onChange={handleAddChange}
                    placeholder="9876543210" maxLength={10} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-control"
                    value={addForm.gender} onChange={handleAddChange}>
                    <option value="">— Select —</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Blood Group + Password */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select name="bloodGroup" className="form-control"
                    value={addForm.bloodGroup} onChange={handleAddChange}>
                    <option value="">— Select —</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Password</label>
                  <input name="password" type="text" className="form-control"
                    value={addForm.password} onChange={handleAddChange}
                    placeholder="Patient@1234" />
                </div>
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea name="address" className="form-control" rows={2}
                  value={addForm.address} onChange={handleAddChange}
                  placeholder="123 Main Street, City, State"
                  style={{ resize:'vertical' }} />
              </div>

              <p style={{ fontSize:'0.75rem', color:'#64748b', marginTop:'-0.5rem' }}>
                * Patient will receive login credentials at the provided email.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
                {saving
                  ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }} /> Adding…</>
                  : 'Add Patient'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
