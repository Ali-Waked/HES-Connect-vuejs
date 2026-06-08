import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = ref(saved ? saved === 'dark' : prefersDark)

  function applyTheme(dark) {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  applyTheme(isDark.value)

  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
    applyTheme(val)
  })

  function toggle() {
    isDark.value = !isDark.value
  }

  function setDark(value) {
    isDark.value = value
  }

  return { isDark, toggle, setDark }
})
