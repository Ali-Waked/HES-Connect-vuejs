import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const saved = localStorage.getItem('theme')

  const isDark = ref(
    saved
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  const applyTheme = (dark) => {
    document.documentElement.classList.toggle('dark', dark)
  }

  watch(
    isDark,
    (value) => {
      localStorage.setItem('theme', value ? 'dark' : 'light')
      applyTheme(value)
    },
    { immediate: true }
  )

  const toggle = () => {
    isDark.value = !isDark.value
  }

  const setDark = (value) => {
    isDark.value = value
  }

  return {
    isDark,
    toggle,
    setDark,
  }
})