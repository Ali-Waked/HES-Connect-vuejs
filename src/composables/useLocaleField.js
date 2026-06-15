import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '../utils/locale'

export function useLocaleField() {
  const { locale } = useI18n()

  function localField(obj, field) {
    if (!obj) return ''
    const val = obj[field]
    const resolved = resolveTranslatedValue(val, locale.value)
    if (resolved) return resolved
    const legacyKey = `${field}_${locale.value}`
    return obj[legacyKey] || obj[`${field}_en`] || obj[`${field}_ar`] || ''
  }

  return { localField }
}
