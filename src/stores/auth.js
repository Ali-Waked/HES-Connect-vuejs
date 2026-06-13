import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosClient, { csrfCookie } from '@/axiosClient'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const errors  = ref({})
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function fetchUser() {
    try {
      const { data } = await axiosClient.get('/user')
      user.value = {
        ...data,
        initials: data.name
          ? data.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
          : '?'
      }
    } catch {
      user.value = null
    }
  }

  async function login(credentials) {
    errors.value  = {}
    loading.value = true
    try {
      console.log(credentials);
      await csrfCookie()
      await axiosClient.post('/login', credentials)
      await fetchUser()
      return { success: true }
    } catch (err) {
      console.log(err);
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors ?? {}
      } else if (err.response?.status === 429) {
        errors.value = { email: ['Too many attempts. Please wait and try again.'] }
      } else {
        errors.value = { email: ['Invalid credentials. Please try again.'] }
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
        errors.value = { email: ['Registration failed. Please try again.'] }
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
        initials: name
          .split(' ')
          .map(w => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      }
    }
  }

  async function init() {
    await fetchUser()
  }

  return {
    user,
    errors,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    init,
  }
})