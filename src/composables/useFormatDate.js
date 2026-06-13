// composables/useFormatDate.js

import { useI18n } from 'vue-i18n'

export function useFormatDate() {
  const { locale } = useI18n()

  function formatDate(dateString) {
    if (!dateString) return '—'

    return new Date(dateString).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return { formatDate }
}