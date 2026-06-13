import { watch } from 'vue'
import { useLanguageStore } from '@/stores/language'

export function useRefetchOnLanguageChange(callback) {
  const languageStore = useLanguageStore()

  watch(
    () => languageStore.currentLanguage,
    () => {
      callback()
    }
  )
}
