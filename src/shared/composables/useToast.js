import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useToast() {
  const { t } = useI18n()
  const toasts = ref([])
  let nextId = 0

  function add(type, message, duration = 4000) {
    const id = ++nextId
    toasts.value.push({ id, type, message })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  function remove(id) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function success(message) {
    return add('success', message)
  }

  function error(message) {
    return add('error', message, 6000)
  }

  function warning(message) {
    return add('warning', message, 5000)
  }

  function info(message) {
    return add('info', message, 4000)
  }

  return {
    toasts,
    add,
    remove,
    success,
    error,
    warning,
    info,
  }
}
