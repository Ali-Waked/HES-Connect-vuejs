import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as specializationService from '@/services/specializationService'

export function useSpecializations() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const specializations = ref([])
  const pagination = ref({})
  const currentSpecialization = ref(null)
  const currentSymptoms = ref([])

  let _lastParams = {}

  async function fetchSpecializations(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await specializationService.getSpecializations(params)
      specializations.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load specializations'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => {
    fetchSpecializations(_lastParams)
  })

  async function fetchSpecialization(uuid) {
    const { data } = await specializationService.getSpecialization(uuid)
    currentSpecialization.value = data.data
    return data.data
  }

  async function createSpecialization(formData) {
    saving.value = true
    try {
      await specializationService.createSpecialization(formData)
      store.addToast(t('specializations.created') || 'Specialization created successfully', 'success')
      await fetchSpecializations(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create specialization'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateSpecialization(uuid, formData) {
    saving.value = true
    try {
      await specializationService.updateSpecialization(uuid, formData)
      store.addToast(t('specializations.updated') || 'Specialization updated successfully', 'success')
      await fetchSpecializations(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update specialization'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteSpecialization(uuid) {
    try {
      await specializationService.deleteSpecialization(uuid)
      store.addToast(t('specializations.deleted') || 'Specialization deleted successfully', 'success')
      if (specializations.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchSpecializations(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete specialization'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  async function fetchSpecializationSymptoms(uuid) {
    try {
      const { data } = await specializationService.getSpecializationSymptoms(uuid)
      currentSymptoms.value = data.data || []
      return data.data || []
    } catch (err) {
      currentSymptoms.value = []
      return []
    }
  }

  async function syncSymptoms(uuid, symptomIds) {
    saving.value = true
    try {
      const { data } = await specializationService.syncSpecializationSymptoms(uuid, symptomIds)
      store.addToast(t('specializations.symptomsSynced') || 'Symptoms synchronized successfully', 'success')
      currentSpecialization.value = data.data
      currentSymptoms.value = data.data.symptoms || []
      await fetchSpecializations(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to sync symptoms'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function attachSymptoms(uuid, symptomIds) {
    saving.value = true
    try {
      const { data } = await specializationService.attachSpecializationSymptoms(uuid, symptomIds)
      store.addToast(t('specializations.symptomsAttached') || 'Symptoms attached successfully', 'success')
      currentSpecialization.value = data.data
      currentSymptoms.value = data.data.symptoms || []
      await fetchSpecializations(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to attach symptoms'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function detachSymptom(uuid, symptomId) {
    saving.value = true
    try {
      const { data } = await specializationService.detachSpecializationSymptom(uuid, symptomId)
      store.addToast(t('specializations.symptomDetached') || 'Symptom detached successfully', 'success')
      currentSpecialization.value = data.data
      currentSymptoms.value = data.data.symptoms || []
      await fetchSpecializations(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to detach symptom'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  return {
    specializations,
    loading,
    error,
    saving,
    pagination,
    currentSpecialization,
    currentSymptoms,
    fetchSpecializations,
    fetchSpecialization,
    createSpecialization,
    updateSpecialization,
    deleteSpecialization,
    fetchSpecializationSymptoms,
    syncSymptoms,
    attachSymptoms,
    detachSymptom,
  }
}
