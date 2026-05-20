import { createSlice } from '@reduxjs/toolkit'

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    darkMode: localStorage.getItem('medicoai_theme') === 'dark',
  },
  reducers: {
    toggleTheme(state) {
      state.darkMode = !state.darkMode
      localStorage.setItem('medicoai_theme', state.darkMode ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light')
    },
  },
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer
