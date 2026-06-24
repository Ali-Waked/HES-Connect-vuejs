import { useAuthStore } from '@/stores/auth'

function checkPermission(value) {
  const authStore = useAuthStore()
  return authStore.can(value)
}

function checkAny(permissions) {
  const authStore = useAuthStore()
  return authStore.canAny(permissions)
}

function checkAll(permissions) {
  const authStore = useAuthStore()
  return authStore.canAll(permissions)
}

export const permission = {
  mounted(el, binding) {
    if (!checkPermission(binding.value)) {
      el.remove()
    }
  }
}

export const permissionAny = {
  mounted(el, binding) {
    if (!checkAny(binding.value)) {
      el.remove()
    }
  }
}

export const permissionAll = {
  mounted(el, binding) {
    if (!checkAll(binding.value)) {
      el.remove()
    }
  }
}
