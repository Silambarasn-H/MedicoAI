import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import adminService from '../../services/adminService'
import authService from '../../services/authService'

const SPECIALIZATIONS = [
  'Cardiology','Dermatology','Endocrinology','Gastroenterology',
  'General Medicine','Neurology','Oncology','Ophthalmology',
  'Orthopedics','Pediatrics','Psychiatry','Pulmonology','Urology',
]

const EMPTY_FORM = {
  fullName:'', email:'', password:'', phone:'',
  specialization:'General Medicine', qualification:'',
  experienceYears:'', licenseNumber:'', consultationFee:'',
  availableDays:'Mon-Fri', availableTime:'09:00-17:00', bio:'',
}

export default function ManageDoctors() {
  const [doctors,   setDoctors]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [page,      setPage]      = useState(0)
  const [totalPages,setTotalPages]= useState(1)
  const [modal,     setModal]     = useState(null)   // null | 'add' | 'edit' | 'delete' | 'view'
  const [selected,  setSelected]  = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)
  const [specFilter,setSpecFilter]= useState('')

  const PAGE_SIZE = 8

  const fetchDoctors = useCallback(() => {
    setLoading(true)
    adminService.getAllDoctors({
      page, size: PAGE_SIZE,
      search:         search         || undefined,
      specialization: specFilter     || undefined,
      sortBy: 'createdAt', sortDir: 'desc',
    })
      .then(({ data }) => {
        const d = data?.data
        if (d?.content) {
          setDoctors(d.content)
          setTotalPages(d.totalPages || 1)
        } else if (Array.isArray(d)) {
          setDoctors(d)
          setTotalPages(1)
        } else {
          setDoctors(MOCK_DOCTORS)
          setTotalPages(1)
        }
      })
      .catch(() => { setDoctors(MOCK_DOCTORS); setTotalPages(1) })
      .finally(() => setLoading(false))
  }, [page, search, specFilter])

  useEffect(() => { fetchDoctors() }, [fetchDoctors])

  const openAdd  = () => { setForm(EMPTY_FORM); setModal('add') }
  const openEdit = (d) => {
    setSelected(d)
    setForm({
      fullName: d.fullName || d.user?.fullName || '',
      email: d.email || d.user?.email || '',
      password: '',
      phone: d.phone || d.user?.phone || '',
      specialization: d.specialization || '',
      qualification: d.qualification || '',
      experienceYears: d.experienceYears || '',
      licenseNumber: d.licenseNumber || '',
      consultationFee: d.consultationFee || '',
      availableDays: d.availableDays || '',
      availableTime: d.availableTime || '',
      bio: d.bio || '',
    })
    setModal('edit')
  }
  const openDelete = (d) => { setSelected(d); setModal('delete') }
  const openView   = (d) => { setSelected(d); setModal('view') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSave = async () => {
    if (!form.specialization) {
      toast.error('Specialization is required')
      return
    }
    if (modal === 'add' && (!form.fullName || !form.email || !form.password)) {
      toast.error('Full name, email and password are required')
      return
    }
    setSaving(true)
    try {
      if (modal === 'add') {
        // Step 1: register the user account with DOCTOR role
        const { data: regData } = await authService.register({
            fullName: form.fullName,
            email:    form.email,
            password: form.password,
            phone:    form.phone || undefined,
            role:     'DOCTOR',
          })
        
        const newUserId = regData?.data?.userId
        if (!newUserId) throw new Error('Registration did not return a userId')

        // Step 2: create the doctor profile linked to that user
        await adminService.createDoctor({
          userId:          newUserId,
          specialization:  form.specialization,
          qualification:   form.qualification  || undefined,
          experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
          licenseNumber:   form.licenseNumber   || undefined,
          consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
          availableDays:   form.availableDays   || undefined,
          availableTime:   form.availableTime   || undefined,
          bio:             form.bio             || undefined,
        })
        toast.success('Doctor added successfully')
      } else {
        // Edit: only update doctor-profile fields (not user account)
        await adminService.updateDoctor(selected.id, {
          specialization:  form.specialization,
          qualification:   form.qualification  || undefined,
          experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
          licenseNumber:   form.licenseNumber   || undefined,
          consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
          availableDays:   form.availableDays   || undefined,
          availableTime:   form.availableTime   || undefined,
          bio:             form.bio             || undefined,
        })
        toast.success('Doctor updated successfully')
      }
      closeModal()
      fetchDoctors()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await adminService.deleteDoctor(selected.id)
      toast.success('Doctor removed')
      closeModal()
      fetchDoctors()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  const filtered = doctors.filter((d) => {
    const name = (d.fullName || d.user?.fullName || '').toLowerCase()
    const spec = (d.specialization || '').toLowerCase()
    return name.includes(search.toLowerCase()) || spec.includes(search.toLowerCase())
  })

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Doctors</h1>
          <p>{doctors.length} doctors registered</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Doctor</button>
      </div>

      <div className="section-card">
        <div className="section-header">
          <span className="section-title">👨‍⚕️ All Doctors</span>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
            <select
              className="form-control"
              style={{ width:180, height:38 }}
              value={specFilter}
              onChange={(e) => { setSpecFilter(e.target.value); setPage(0) }}
            >
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search doctors…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading doctors…</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍⚕️</div>
            <div className="empty-title">No doctors found</div>
            <div className="empty-sub">Try adjusting your search or add a new doctor</div>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th><th>Doctor</th><th>Specialization</th>
                    <th>Experience</th><th>Fee</th><th>Availability</th>
                    <th>Rating</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => (
                    <tr key={d.id}>
                      <td style={{ color:'#64748b' }}>{page * PAGE_SIZE + i + 1}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                          <div style={{
                            width:34, height:34, borderRadius:'50%',
                            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:'0.75rem', fontWeight:700, color:'#fff', flexShrink:0,
                          }}>
                            {(d.fullName || d.user?.fullName || 'D').charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight:600, color:'#e2e8f0' }}>
                              {d.fullName || d.user?.fullName}
                            </div>
                            <div style={{ fontSize:'0.75rem', color:'#64748b' }}>
                              {d.email || d.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-info">{d.specialization}</span></td>
                      <td>{d.experienceYears ? `${d.experienceYears} yrs` : '—'}</td>
                      <td>{d.consultationFee ? `₹${d.consultationFee}` : '—'}</td>
                      <td style={{ fontSize:'0.8rem', color:'#94a3b8' }}>{d.availableDays || '—'}</td>
                      <td>
                        {d.rating ? (
                          <span style={{ color:'#fbbf24' }}>★ {Number(d.rating).toFixed(1)}</span>
                        ) : '—'}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openView(d)} title="View">👁</button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(d)} title="Edit">✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => openDelete(d)} title="Delete">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span className="page-info">
                Page {page + 1} of {totalPages}
              </span>
              <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={i}
                  className={`page-btn${page === i ? ' active' : ''}`}
                  onClick={() => setPage(i)}
                >{i + 1}</button>
              ))}
              <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'add' ? '➕ Add Doctor' : '✏️ Edit Doctor'}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input name="fullName" className="form-control" value={form.fullName} onChange={handleChange} placeholder="Dr. John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} placeholder="doctor@example.com" />
                </div>
              </div>
              {modal === 'add' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} placeholder="Min 8 chars" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input name="phone" className="form-control" value={form.phone} onChange={handleChange} placeholder="9876543210" />
                  </div>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <select name="specialization" className="form-control" value={form.specialization} onChange={handleChange}>
                    {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input name="qualification" className="form-control" value={form.qualification} onChange={handleChange} placeholder="MBBS, MD" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input name="experienceYears" type="number" className="form-control" value={form.experienceYears} onChange={handleChange} placeholder="5" />
                </div>
                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <input name="licenseNumber" className="form-control" value={form.licenseNumber} onChange={handleChange} placeholder="MCI-12345" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input name="consultationFee" type="number" className="form-control" value={form.consultationFee} onChange={handleChange} placeholder="500" />
                </div>
                <div className="form-group">
                  <label className="form-label">Available Days</label>
                  <input name="availableDays" className="form-control" value={form.availableDays} onChange={handleChange} placeholder="Mon-Fri" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea name="bio" className="form-control" rows={3} value={form.bio} onChange={handleChange} placeholder="Brief professional bio…" style={{ resize:'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : modal === 'add' ? 'Add Doctor' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">👁 Doctor Details</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
                <div style={{
                  width:72, height:72, borderRadius:'50%',
                  background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.5rem', fontWeight:700, color:'#fff', margin:'0 auto 0.75rem',
                }}>
                  {(selected.fullName || selected.user?.fullName || 'D').charAt(0)}
                </div>
                <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#f1f5f9' }}>
                  {selected.fullName || selected.user?.fullName}
                </div>
                <span className="badge badge-info" style={{ marginTop:'0.4rem' }}>
                  {selected.specialization}
                </span>
              </div>
              {[
                ['Email',       selected.email || selected.user?.email],
                ['Phone',       selected.phone || selected.user?.phone || '—'],
                ['Qualification', selected.qualification || '—'],
                ['Experience',  selected.experienceYears ? `${selected.experienceYears} years` : '—'],
                ['License',     selected.licenseNumber || '—'],
                ['Fee',         selected.consultationFee ? `₹${selected.consultationFee}` : '—'],
                ['Availability',selected.availableDays || '—'],
                ['Rating',      selected.rating ? `★ ${Number(selected.rating).toFixed(1)} (${selected.totalReviews || 0} reviews)` : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #334155' }}>
                  <span style={{ color:'#64748b', fontSize:'0.85rem' }}>{k}</span>
                  <span style={{ color:'#e2e8f0', fontSize:'0.85rem', fontWeight:500 }}>{v}</span>
                </div>
              ))}
              {selected.bio && (
                <div style={{ marginTop:'1rem' }}>
                  <div style={{ color:'#64748b', fontSize:'0.8rem', marginBottom:'0.4rem' }}>BIO</div>
                  <p style={{ color:'#94a3b8', fontSize:'0.875rem', lineHeight:1.6 }}>{selected.bio}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Close</button>
              <button className="btn btn-primary" onClick={() => { closeModal(); openEdit(selected) }}>Edit</button>
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
                <div className="confirm-title">Remove Doctor?</div>
                <div className="confirm-msg">
                  Are you sure you want to remove <strong style={{ color:'#f1f5f9' }}>
                    {selected.fullName || selected.user?.fullName}
                  </strong>? This action cannot be undone.
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
    </>
  )
}

/* ── Mock data fallback ── */
const MOCK_DOCTORS = [
  { id:1, fullName:'Dr. Priya Sharma',  email:'priya@medicoai.com', specialization:'Cardiology',      experienceYears:12, consultationFee:800,  availableDays:'Mon-Fri', rating:4.8, totalReviews:124 },
  { id:2, fullName:'Dr. Arjun Mehta',   email:'arjun@medicoai.com', specialization:'Neurology',       experienceYears:8,  consultationFee:1000, availableDays:'Mon-Sat', rating:4.6, totalReviews:98  },
  { id:3, fullName:'Dr. Sunita Rao',    email:'sunita@medicoai.com',specialization:'Pediatrics',      experienceYears:15, consultationFee:600,  availableDays:'Tue-Sat', rating:4.9, totalReviews:210 },
  { id:4, fullName:'Dr. Vikram Singh',  email:'vikram@medicoai.com',specialization:'Orthopedics',     experienceYears:10, consultationFee:900,  availableDays:'Mon-Fri', rating:4.5, totalReviews:76  },
  { id:5, fullName:'Dr. Meena Joshi',   email:'meena@medicoai.com', specialization:'Dermatology',     experienceYears:6,  consultationFee:700,  availableDays:'Mon-Fri', rating:4.7, totalReviews:145 },
]
