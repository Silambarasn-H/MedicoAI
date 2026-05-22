import api from './api'

const prescriptionService = {
  // Admin: all prescriptions (paginated + searchable)
  getAll:           (params)     => api.get('/prescriptions',                    { params }),

  // By ID
  getById:          (id)         => api.get(`/prescriptions/${id}`),

  // Doctor: create
  create:           (data)       => api.post('/prescriptions',                   data),

  // Doctor: update
  update:           (id, data)   => api.put(`/prescriptions/${id}`,              data),

  // Doctor: own prescriptions
  getMy:            (params)     => api.get('/prescriptions/my',                 { params }),

  // By patient profile ID
  getByPatient:     (id, params) => api.get(`/prescriptions/patient/${id}`,      { params }),

  // By doctor profile ID
  getByDoctor:      (id, params) => api.get(`/prescriptions/doctor/${id}`,       { params }),

  // By appointment ID
  getByAppointment: (id, params) => api.get(`/prescriptions/appointment/${id}`,  { params }),

  // Admin: delete
  delete:           (id)         => api.delete(`/prescriptions/${id}`),
}

export default prescriptionService
