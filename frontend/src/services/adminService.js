import api from './api'

/**
 * adminService – all API calls used by the Admin dashboard.
 *
 * Doctor and Patient endpoints now point to the real Spring Boot
 * CRUD controllers implemented in Phase 1.
 */
const adminService = {

  // ── Dashboard ──────────────────────────────────────────────────────
  getDashboardStats:    ()           => api.get('/admin/dashboard'),
  getReportsSummary:    ()           => api.get('/admin/reports/summary'),
  getRevenueReport:     (params)     => api.get('/admin/reports/revenue',       { params }),
  getAppointmentReport: (params)     => api.get('/admin/reports/appointments',  { params }),

  // ── Users (admin-level) ────────────────────────────────────────────
  getAllUsers:     (params)          => api.get('/admin/users',                 { params }),
  toggleUserStatus:(id, active)     => api.put(`/admin/users/${id}/status`,    { active }),
  deleteUser:      (id)             => api.delete(`/admin/users/${id}`),

  // ── Doctors — real CRUD endpoints ─────────────────────────────────
  /**
   * GET /doctors?search=&specialization=&page=&size=&sortBy=&sortDir=
   * Returns Page<DoctorResponse>
   */
  getAllDoctors: (params) => api.get('/doctors', { params }),

  /** GET /doctors/specializations — distinct list for filter dropdown */
  getSpecializations: () => api.get('/doctors/specializations'),

  /** GET /doctors/{id} */
  getDoctorById: (id) => api.get(`/doctors/${id}`),

  /**
   * POST /doctors
   * Body: { userId?, specialization, qualification, experienceYears,
   *         licenseNumber, consultationFee, availableDays, availableTime, bio }
   */
  createDoctor: (data) => api.post('/doctors', data),

  /**
   * PUT /doctors/{id}
   * Body: same shape as createDoctor (all fields optional for patch)
   */
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),

  /** PUT /doctors/{id}/status?active=true|false */
  toggleDoctorStatus: (id, active) => api.put(`/doctors/${id}/status`, null, { params: { active } }),

  /** DELETE /doctors/{id} — soft delete */
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),

  // ── Patients — real CRUD endpoints ────────────────────────────────
  /**
   * GET /patients?search=&gender=&page=&size=&sortBy=&sortDir=
   * Returns Page<PatientResponse>
   */
  getAllPatients: (params) => api.get('/patients', { params }),

  /** GET /patients/{id} */
  getPatientById: (id) => api.get(`/patients/${id}`),

  /**
   * POST /patients
   * Body: { userId?, bloodGroup, dateOfBirth, gender, address,
   *         emergencyContact, allergies, chronicDiseases, insuranceId }
   */
  createPatient: (data) => api.post('/patients', data),

  /** PUT /patients/{id} */
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),

  /** PUT /patients/{id}/status?active=true|false */
  togglePatientStatus: (id, active) => api.put(`/patients/${id}/status`, null, { params: { active } }),

  /** DELETE /patients/{id} — soft delete */
  deletePatient: (id) => api.delete(`/patients/${id}`),

  // ── Appointments ───────────────────────────────────────────────────
  getAllAppointments: (params)       => api.get('/appointments',              { params }),
  getAppointmentById:(id)           => api.get(`/appointments/${id}`),
  bookAppointment:   (data)         => api.post('/appointments',              data),
  updateAppointment: (id, data)     => api.put(`/appointments/${id}`,         data),
  cancelAppointment: (id, reason)   => api.put(`/appointments/${id}/cancel`,  reason ? { reason } : {}),
  rescheduleAppt:    (id, newDate, newTime) =>
    api.put(`/appointments/${id}/reschedule`, { newDate, newTime }),
  confirmAppointment:(id)           => api.put(`/appointments/${id}/confirm`),
  completeAppointment:(id)          => api.put(`/appointments/${id}/complete`),

  // ── Notifications ──────────────────────────────────────────────────
  getNotifications: ()    => api.get('/notifications'),
  markRead:         (id)  => api.put(`/notifications/${id}/read`),
  markAllRead:      ()    => api.put('/notifications/read-all'),
}

export default adminService
