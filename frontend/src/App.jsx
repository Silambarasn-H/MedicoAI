import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'

// Layouts
import AdminLayout   from './components/admin/AdminLayout'
import DoctorLayout  from './components/doctor/DoctorLayout'
import PatientLayout from './components/patient/PatientLayout'

// Auth Pages — DO NOT MODIFY
import LoginPage          from './pages/auth/LoginPage'
import RegisterPage       from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage  from './pages/auth/ResetPasswordPage'

// Admin Pages
import AdminDashboard     from './pages/admin/AdminDashboard'
import ManageDoctors      from './pages/admin/ManageDoctors'
import ManagePatients     from './pages/admin/ManagePatients'
import AdminAppointments  from './pages/admin/AdminAppointments'
import AdminReports       from './pages/admin/AdminReports'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminSettings      from './pages/admin/AdminSettings'
import AdminPrescriptions from './pages/admin/AdminPrescriptions'

// Doctor Pages
import DoctorDashboard    from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorPatients     from './pages/doctor/DoctorPatients'
import AddPrescription    from './pages/doctor/AddPrescription'

// Patient Pages
import PatientDashboard     from './pages/patient/PatientDashboard'
import BookAppointment      from './pages/patient/BookAppointment'
import PatientPrescriptions from './pages/patient/PatientPrescriptions'
import PatientReports       from './pages/patient/PatientReports'
import PaymentHistory       from './pages/patient/PaymentHistory'
import PatientProfile       from './pages/patient/PatientProfile'

// 404
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"                element={<Navigate to="/login" replace />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />

      {/* ── Admin — nested inside AdminLayout (sidebar + topbar) ── */}
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                element={<AdminDashboard />} />
          <Route path="doctors"       element={<ManageDoctors />} />
          <Route path="patients"      element={<ManagePatients />} />
          <Route path="appointments"  element={<AdminAppointments />} />
          <Route path="prescriptions" element={<AdminPrescriptions />} />
          <Route path="reports"       element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings"      element={<AdminSettings />} />
        </Route>
      </Route>

      {/* ── Doctor — nested inside DoctorLayout (same dark sidebar design) ── */}
      <Route element={<ProtectedRoute role="DOCTOR" />}>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index                    element={<DoctorDashboard />} />
          <Route path="appointments"      element={<DoctorAppointments />} />
          <Route path="patients"          element={<DoctorPatients />} />
          <Route path="prescription/new"  element={<AddPrescription />} />
        </Route>
      </Route>

      {/* ── Patient — nested inside PatientLayout (same dark sidebar design) ── */}
      <Route element={<ProtectedRoute role="PATIENT" />}>
        <Route path="/patient" element={<PatientLayout />}>
          <Route index                element={<PatientDashboard />} />
          <Route path="book"          element={<BookAppointment />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="reports"       element={<PatientReports />} />
          <Route path="payments"      element={<PaymentHistory />} />
          <Route path="profile"       element={<PatientProfile />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
