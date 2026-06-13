import { useI18n } from 'vue-i18n'

export function useLocaleField() {
  const { locale } = useI18n()

  function localField(obj, field) {
    if (!obj) return ''
    const lang = locale.value
    const val = obj[field]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return val[lang] || val.en || val.ar || ''
    }
    const legacyKey = `${field}_${lang}`
    return obj[legacyKey] || obj[`${field}_en`] || obj[`${field}_ar`] || obj[field] || ''
  }

  return { localField }
}
