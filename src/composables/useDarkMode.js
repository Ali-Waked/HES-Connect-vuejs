import { useThemeStore } from '@/stores/useThemeStore'
import { computed } from 'vue'

export function useDarkMode() {
  const themeStore = useThemeStore()
  const isDark = computed(() => themeStore.isDark)
  const toggleDarkMode = themeStore.toggle

  return { isDark, toggleDarkMode }
}
