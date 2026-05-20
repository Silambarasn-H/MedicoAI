import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginStart, loginSuccess, loginFailure, logout } from '../context/authSlice'
import authService from '../services/authService'
import { toast } from 'react-toastify'

/**
 * useAuth – custom hook for authentication actions
 */
export function useAuth() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user, token, loading, error } = useSelector((state) => state.auth)

  const login = async (credentials) => {
    dispatch(loginStart())
    try {
      const { data } = await authService.login(credentials)
      dispatch(loginSuccess(data.data))
      toast.success('Welcome back!')
      const dashboardMap = { ADMIN: '/admin', DOCTOR: '/doctor', PATIENT: '/patient' }
      navigate(dashboardMap[data.data.role] || '/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      dispatch(loginFailure(msg))
      toast.error(msg)
    }
  }

  const register = async (userData) => {
    dispatch(loginStart())
    try {
      const { data } = await authService.register(userData)
      dispatch(loginSuccess(data.data))
      toast.success('Registration successful!')
      navigate('/patient')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      dispatch(loginFailure(msg))
      toast.error(msg)
    }
  }

  const handleLogout = () => {
    // Client-side only — no backend call to avoid 401 interceptor firing
    dispatch(logout())
    navigate('/login')
    toast.info('Logged out successfully')
  }

  return { user, token, loading, error, login, register, logout: handleLogout }
}
