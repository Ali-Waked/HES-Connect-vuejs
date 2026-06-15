/**
 * Safely resolves a translatable value that may be:
 *   - a plain string ("John Doe")
 *   - a translation object ({ en: "John Doe", ar: "جون دو" })
 *   - null / undefined
 *
 * Falls back through: current locale → en → ar → ''
 *
 * @param {string|{en?:string,ar?:string}|null|undefined} value
 * @param {string} [locale]
 * @returns {string}
 */
export function resolveTranslatedValue(value, locale) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && !Array.isArray(value)) {
    if (locale && value[locale]) return value[locale]
    if (value.en) return value.en
    if (value.ar) return value.ar
    return ''
  }
  return String(value)
}

/**
 * Extracts a single initial character from a potentially translated name,
 * stripping common title prefixes (Dr., Dr, etc.).
 *
 * @param {string|{en?:string,ar?:string}|null|undefined} name
 * @param {string} [locale]
 * @returns {string} Single uppercase character or '?'
 */
export function getNameInitial(name, locale) {
  const resolved = resolveTranslatedValue(name, locale)
  if (!resolved) return '?'
  return resolved.replace(/^(Dr\.?|Dr)\s+/i, '').charAt(0).toUpperCase()
}

/**
 * Generates up to 2 initials (e.g. "JD" for "John Doe") from a
 * potentially translated name.
 *
 * @param {string|{en?:string,ar?:string}|null|undefined} name
 * @param {string} [locale]
 * @returns {string}
 */
export function getInitials(name, locale) {
  const resolved = resolveTranslatedValue(name, locale)
  if (!resolved) return '?'
  return resolved
    .replace(/^(Dr\.?|Dr)\s+/i, '')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
