import { createSlice } from '@reduxjs/toolkit'

const storedUser  = JSON.parse(localStorage.getItem('medicoai_user'))  || null
const storedToken = localStorage.getItem('medicoai_token') || null

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    storedUser,
    token:   storedToken,
    loading: false,
    error:   null,
  },
  reducers: {
    loginStart(state) {
      state.loading = true
      state.error   = null
    },
    loginSuccess(state, action) {
      // Backend AuthResponse is flat: { accessToken, userId, fullName, email, role, ... }
      const { accessToken, ...userInfo } = action.payload
      state.loading = false
      state.user    = userInfo
      state.token   = accessToken
      localStorage.setItem('medicoai_user',  JSON.stringify(userInfo))
      localStorage.setItem('medicoai_token', accessToken)
    },
    loginFailure(state, action) {
      state.loading = false
      state.error   = action.payload
    },
    logout(state) {
      state.user    = null
      state.token   = null
      state.loading = false
      state.error   = null
      localStorage.removeItem('medicoai_user')
      localStorage.removeItem('medicoai_token')
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('medicoai_user', JSON.stringify(state.user))
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions
export default authSlice.reducer
