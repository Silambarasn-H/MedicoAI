import api from './api'

const doctorService = {
  getAll:              (params) => api.get('/doctors', { params }),
  getById:             (id)     => api.get(`/doctors/${id}`),
  getBySpecialization: (spec)   => api.get(`/doctors/specialization/${spec}`),
  create:              (data)   => api.post('/doctors', data),
  update:              (id, data) => api.put(`/doctors/${id}`, data),
  getMyAppointments:   ()       => api.get('/doctors/me/appointments'),
  getMyPatients:       ()       => api.get('/doctors/me/patients'),
}

export default doctorService
