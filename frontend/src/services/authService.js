import api from './api'

const authService = {
  login:         (data)  => api.post('/auth/login', data),
  register:      (data)  => api.post('/auth/register', data),
  // logout is handled client-side only (clear localStorage + Redux)
  // No backend call — avoids 401 interceptor firing on logout
  refreshToken:  (token) => api.post('/auth/refresh-token', { refreshToken: token }),
  forgotPassword:(data)  => api.post('/auth/forgot-password', data),
  resetPassword: (data)  => api.post('/auth/reset-password', data),
}

export default authService
