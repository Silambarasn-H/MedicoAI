import api from './api'

const prescriptionService = {
  getById:          (id)        => api.get(`/prescriptions/${id}`),
  create:           (data)      => api.post('/prescriptions', data),
  update:           (id, data)  => api.put(`/prescriptions/${id}`, data),
  getByPatient:     (patientId) => api.get(`/prescriptions/patient/${patientId}`),
  getByAppointment: (apptId)    => api.get(`/prescriptions/appointment/${apptId}`),
}

export default prescriptionService
