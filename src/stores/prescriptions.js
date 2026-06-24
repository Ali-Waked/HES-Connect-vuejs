import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDashboardStore } from './dashboard'
import * as prescriptionsService from '@/services/prescriptions'

export const usePrescriptionsStore = defineStore('prescriptions', () => {
  const prescriptions = ref([])
  const prescription = ref(null)
  const pharmacies = ref([])
  const analytics = ref({ total: 0, active: 0, dispensed: 0, cancelled: 0 })
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const pagination = ref({ current_page: 1, last_page: 1, total: 0, per_page: 15 })

  let _lastParams = {}

  async function fetchPrescriptions(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await prescriptionsService.getAdminPrescriptions(params)
      prescriptions.value = data.data || []
      if (data.meta) {
        pagination.value = {
          current_page: data.meta.current_page || 1,
          last_page: data.meta.last_page || 1,
          total: data.meta.total || 0,
          per_page: data.meta.per_page || 15,
        }
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load prescriptions'
      prescriptions.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchPrescription(uuid) {
    loading.value = true
    prescription.value = null
    error.value = null
    try {
      const { data } = await prescriptionsService.getAdminPrescription(uuid)
      prescription.value = data.data || data
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load prescription'
    } finally {
      loading.value = false
    }
  }

  async function fetchAnalytics(params = {}) {
    try {
      const { data } = await prescriptionsService.getAdminPrescriptionAnalytics(params)
      analytics.value = {
        total: data.total_prescriptions ?? data.total ?? 0,
        active: data.active_prescriptions ?? data.active ?? 0,
        dispensed: data.dispensed_prescriptions ?? data.dispensed ?? 0,
        cancelled: data.cancelled_prescriptions ?? data.cancelled ?? 0,
      }
    } catch {
      analytics.value = { total: 0, active: 0, dispensed: 0, cancelled: 0 }
    }
  }

  async function fetchAvailablePharmacies(uuid) {
    try {
      const { data } = await prescriptionsService.getPrescriptionPharmacies(uuid)
      pharmacies.value = data.data || data || []
    } catch {
      pharmacies.value = []
    }
  }

  async function selectPharmacy(uuid, data) {
    saving.value = true
    try {
      await prescriptionsService.selectPharmacy(uuid, data)
      useDashboardStore().addToast('Pharmacy selected successfully', 'success')
      return { success: true }
    } catch (err) {
      useDashboardStore().addToast(err.response?.data?.message || 'Failed to select pharmacy', 'error')
      return { success: false, error: err.response?.data?.message || 'Failed to select pharmacy' }
    } finally {
      saving.value = false
    }
  }

  function clearPrescription() {
    prescription.value = null
  }

  function clearPharmacies() {
    pharmacies.value = []
  }

  return {
    prescriptions,
    prescription,
    pharmacies,
    analytics,
    loading,
    saving,
    error,
    pagination,
    fetchPrescriptions,
    fetchPrescription,
    fetchAnalytics,
    fetchAvailablePharmacies,
    selectPharmacy,
    clearPrescription,
    clearPharmacies,
  }
})
