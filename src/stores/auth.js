import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient, { csrfCookie } from '@/axiosClient'
import { resolveTranslatedValue, getInitials } from '../utils/locale'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const errors  = ref({})
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const initCalled = ref(false)

  async function fetchUser() {
    try {
      const { data } = await axiosClient.get('/user')
      
      const userResource = data && data.user ? data.user : data
      if (!userResource) {
        user.value = null
        return
      }

      const roles = data && Array.isArray(data.roles) ? data.roles : (userResource.role ? [userResource.role.name] : [])
      const permissions = data && Array.isArray(data.permissions) ? data.permissions : []

      const primaryRole = roles[0] || null
      const roleObj = primaryRole ? {
        name: primaryRole,
        toString() {
          return this.name
        }
      } : null

      user.value = {
        ...userResource,
        roles,
        permissions,
        role: roleObj,
        initials: getInitials(userResource.name)
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      user.value = null
    }
  }

  async function login(credentials) {
    errors.value  = {}
    loading.value = true
    try {
      await csrfCookie()
      await axiosClient.post('/login', credentials)
      await fetchUser()
      return { success: true }
    } catch (err) {
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors ?? {}
      } else if (err.response?.status === 429) {
        errors.value = { email: ['Too many attempts. Please wait and try again.'] }
      } else {
        errors.value = { general: 'Invalid credentials. Please try again.' }
      }
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function register(form) {
    errors.value  = {}
    loading.value = true
    try {
      await csrfCookie()
      await axiosClient.post('/register', form)
      await fetchUser()
      return { success: true }
    } catch (err) {
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors ?? {}
      } else {
        errors.value = { general: 'Registration failed. Please try again.' }
      }
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await axiosClient.post('/logout')
    } finally {
      user.value = null
    }
  }

  function updateProfile({ name }) {
    if (user.value) {
      user.value = {
        ...user.value,
        name,
        initials: getInitials(name)
      }
    }
  }

  function clearErrors() {
    errors.value = {}
  }

  async function init() {
    if (initCalled.value) return
    await fetchUser()
    initCalled.value = true
  }

  return {
    user,
    errors,
    loading,
    isAuthenticated,
    initCalled,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    clearErrors,
    init,
  }
})
