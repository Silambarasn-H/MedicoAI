import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items:       [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications(state, action) {
      state.items       = action.payload
      state.unreadCount = action.payload.filter((n) => !n.isRead).length
    },
    markRead(state, action) {
      const notif = state.items.find((n) => n.id === action.payload)
      if (notif && !notif.isRead) {
        notif.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.isRead = true))
      state.unreadCount = 0
    },
  },
})

export const { setNotifications, markRead, markAllRead } = notificationSlice.actions
export default notificationSlice.reducer
