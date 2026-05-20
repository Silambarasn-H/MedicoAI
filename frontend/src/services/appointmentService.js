import api from './api'

/**
 * appointmentService – all appointment API calls.
 * Matches AppointmentController endpoints exactly.
 */
const appointmentService = {

  /**
   * GET /appointments?status=&search=&page=&size=&sortBy=&sortDir=
   * Returns Page<AppointmentResponse>  (ADMIN / DOCTOR)
   */
  getAll: (params) => api.get('/appointments', { params }),

  /** GET /appointments/{id} */
  getById: (id) => api.get(`/appointments/${id}`),

  /**
   * GET /appointments/patient/{patientId}?page=&size=
   * Returns Page<AppointmentResponse>
   */
  getByPatient: (patientId, params) =>
    api.get(`/appointments/patient/${patientId}`, { params }),

  /**
   * GET /appointments/doctor/{doctorId}?page=&size=
   * Returns Page<AppointmentResponse>
   */
  getByDoctor: (doctorId, params) =>
    api.get(`/appointments/doctor/${doctorId}`, { params }),

  /**
   * POST /appointments
   * Body: { doctorId, patientId?, appointmentDate, appointmentTime,
   *         type, reason, notes }
   */
  book: (data) => api.post('/appointments', data),

  /**
   * PUT /appointments/{id}
   * Body: { reason?, notes?, type? }
   */
  update: (id, data) => api.put(`/appointments/${id}`, data),

  /**
   * PUT /appointments/{id}/cancel
   * Body: { reason? }
   */
  cancel: (id, reason) =>
    api.put(`/appointments/${id}/cancel`, reason ? { reason } : {}),

  /**
   * PUT /appointments/{id}/reschedule
   * Body: { newDate, newTime }
   */
  reschedule: (id, newDate, newTime) =>
    api.put(`/appointments/${id}/reschedule`, { newDate, newTime }),

  /** PUT /appointments/{id}/confirm  (DOCTOR / ADMIN) */
  confirm: (id) => api.put(`/appointments/${id}/confirm`),

  /** PUT /appointments/{id}/complete  (DOCTOR / ADMIN) */
  complete: (id) => api.put(`/appointments/${id}/complete`),
}

export default appointmentService
