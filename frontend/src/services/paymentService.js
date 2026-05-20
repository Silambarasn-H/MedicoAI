import api from './api'

const paymentService = {
  initiate:      (data)      => api.post('/payments/initiate', data),
  verify:        (data)      => api.post('/payments/verify', data),
  getById:       (id)        => api.get(`/payments/${id}`),
  getByPatient:  (patientId) => api.get(`/payments/patient/${patientId}`),
  refund:        (id)        => api.post(`/payments/${id}/refund`),
}

export default paymentService
