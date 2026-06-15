import { useI18n } from 'vue-i18n'

export function usePermissionHelper() {
  const { locale } = useI18n()

  function getPermissionName(permission, lang) {
    if (!permission) return ''
    const l = lang || locale.value
    const name = permission.name
    if (name && typeof name === 'object') {
      return name[l] || name.en || permission.key || ''
    }
    return permission.key || ''
  }

  function getPermissionDescription(permission, lang) {
    if (!permission) return ''
    const l = lang || locale.value
    const desc = permission.description
    if (desc && typeof desc === 'object') {
      return desc[l] || desc.en || ''
    }
    return desc || ''
  }

  function getPermissionKey(permission) {
    if (!permission) return ''
    return permission.key || ''
  }

  return { getPermissionName, getPermissionDescription, getPermissionKey }
}
