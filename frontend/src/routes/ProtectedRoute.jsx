import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * ProtectedRoute – guards routes by authentication and role.
 * @param {string} role - Required role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
 */
function ProtectedRoute({ role }) {
  const { user, token } = useSelector((state) => state.auth)

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    // Redirect to the user's own dashboard
    const dashboardMap = {
      ADMIN:   '/admin',
      DOCTOR:  '/doctor',
      PATIENT: '/patient',
    }
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
