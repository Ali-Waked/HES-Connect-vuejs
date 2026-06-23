import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient, { csrfCookie } from '@/axiosClient'
import { getInitials } from '../utils/locale'

export const useAuthStore = defineStore('auth', () => {
  const user          = ref(null)
  const loading       = ref(false)
  const authenticated = ref(false)
  const errors        = ref({})
  const initCalled    = ref(false)

  const dashboardRoute = computed(() => user.value?.dashboard_route || null)

  async function fetchUser() {
    try {
      const { data } = await axiosClient.get('/profile')
      user.value = {
        ...data,
        initials: getInitials(typeof data.name === 'string' ? data.name : (data.name?.en || data.name?.ar || ''))
      }
      authenticated.value = true
    } catch {
      user.value = null
      authenticated.value = false
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
      authenticated.value = false
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
    loading,
    authenticated,
    errors,
    initCalled,
    dashboardRoute,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    clearErrors,
    init,
  }
})
