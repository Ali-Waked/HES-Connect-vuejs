import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axiosClient from '@/axiosClient'
import { resolveTranslatedValue, getInitials } from '@/utils/locale'
import { useAuthStore } from './auth'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const uploading = ref({ avatar: false, cover: false })
  const errors = ref({})
  const error = ref('')

  const initials = computed(() => getInitials(profile.value?.name || ''))

  function mapProfile(raw, locale) {
    return {
      ...raw,
      avatarUrl: raw.avatar || raw.avatarUrl || '',
      coverUrl: raw.cover_image || raw.coverUrl || '',
      name: raw.name || '',
      name_display: resolveTranslatedValue(raw.name, locale),
    }
  }

  function syncAuthStore() {
    if (!profile.value) return
    const authStore = useAuthStore()
    if (authStore.user) {
      authStore.user = {
        ...authStore.user,
        avatar: profile.value.avatarUrl,
        name: profile.value.name,
      }
    }
  }

  async function fetchProfile() {
    loading.value = true
    errors.value = {}
    error.value = ''
    try {
      const { data } = await axiosClient.get('/profile')
      const raw = data.user || data
      const locale = localStorage.getItem('lang') || 'en'
      profile.value = mapProfile(raw, locale)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load profile'
      error.value = msg
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(formData) {
    saving.value = true
    errors.value = {}
    error.value = ''
    const prev = profile.value ? { ...profile.value } : null

    if (profile.value) {
      profile.value = { ...profile.value, ...formData }
    }

    try {
      const { data } = await axiosClient.put('/profile', formData)
      const raw = data.user || data
      const locale = localStorage.getItem('lang') || 'en'
      profile.value = mapProfile(raw, locale)
      syncAuthStore()
      return { success: true }
    } catch (err) {
      if (prev) profile.value = prev
      if (err.response?.status === 422) {
        errors.value = err.response.data.errors || {}
        error.value = err.response.data.message || 'Please fix the errors below.'
      } else {
        error.value = err.response?.data?.message || 'Failed to update profile'
      }
      return { success: false, errors: errors.value }
    } finally {
      saving.value = false
    }
  }

  async function uploadImage(kind, file) {
    const field = kind === 'cover' ? 'cover_image' : 'avatar'
    const urlKey = kind === 'cover' ? 'coverUrl' : 'avatarUrl'
    const localPreview = URL.createObjectURL(file)
    const previous = profile.value?.[urlKey]

    uploading.value[kind] = true
    if (profile.value) profile.value[urlKey] = localPreview

    try {
      const formData = new FormData()
      formData.append(field, file)
      formData.append('_method', 'PUT')
      const { data } = await axiosClient.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const raw = data.user || data
      const locale = localStorage.getItem('lang') || 'en'
      profile.value = mapProfile(raw, locale)
      syncAuthStore()
      return profile.value[urlKey] || localPreview
    } catch {
      if (profile.value) profile.value[urlKey] = previous
      throw new Error(`Failed to upload ${field}`)
    } finally {
      uploading.value[kind] = false
    }
  }

  function uploadAvatar(file) {
    return uploadImage('avatar', file)
  }

  function uploadCover(file) {
    return uploadImage('cover', file)
  }

  return {
    profile,
    loading,
    saving,
    uploading,
    errors,
    error,
    initials,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    uploadCover,
  }
})
