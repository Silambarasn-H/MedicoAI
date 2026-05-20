import api from './api'

const patientService = {
  getAll:    (params)    => api.get('/patients', { params }),
  getById:   (id)        => api.get(`/patients/${id}`),
  getMe:     ()          => api.get('/patients/me'),
  create:    (data)      => api.post('/patients', data),
  update:    (id, data)  => api.put(`/patients/${id}`, data),
}

export default patientService
