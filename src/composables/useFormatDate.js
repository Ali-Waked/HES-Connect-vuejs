// composables/useFormatDate.js

import { useI18n } from 'vue-i18n'

export function useFormatDate() {
  const { locale } = useI18n()

  function formatDate(dateString) {
    if (!dateString) return '—'

    // Normalize date string: fix formats like "2026-08-26T00:00:00.000000Z" with extra decimal places
    let normalized = dateString
    const millisecondMatch = dateString.match(/(\.\d{3})(\d+)(Z?)$/)
    if (millisecondMatch) {
      normalized = dateString.replace(/(\.\d{3})\d+(Z?)$/, '$1$2')
    }

    const date = new Date(normalized)
    if (isNaN(date.getTime())) return dateString

    return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return { formatDate }
}