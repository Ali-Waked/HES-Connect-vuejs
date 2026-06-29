import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as patientService from '../services/patientService'

export const usePatientsStore = defineStore('dashboardPatients', () => {
  const items = ref([])
  const currentPatient = ref(null)
  const stats = ref({ total: 0, newThisMonth: 0, active: 0, appointmentsToday: 0 })
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref(null)
  const pagination = ref({ currentPage: 1, lastPage: 1, total: 0, perPage: 15 })

  const totalItems = computed(() => pagination.value.total)

  async function fetchItems(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await patientService.list(params)
      const data = res.data?.data || res.data || []
      const meta = res.data?.meta || res.data?.pagination || {}
      items.value = Array.isArray(data) ? data : []
      pagination.value = {
        currentPage: meta.current_page || meta.currentPage || 1,
        lastPage: meta.last_page || meta.lastPage || 1,
        total: meta.total || 0,
        perPage: meta.per_page || meta.perPage || 15,
      }
    } catch (err) {
      error.value = err.message || 'Failed to load patients.'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const res = await patientService.getPatientStats()
      stats.value = res.data?.data || res.data || stats.value
    } catch {
      /* fail silently */
    }
  }

  async function fetchItem(id) {
    loading.value = true
    error.value = null
    try {
      const res = await patientService.get(id)
      currentPatient.value = res.data?.data || res.data
    } catch (err) {
      error.value = err.message || 'Failed to load patient.'
      currentPatient.value = null
    } finally {
      loading.value = false
    }
  }

  async function createItem(data) {
    actionLoading.value = true
    error.value = null
    try {
      const res = await patientService.create(data)
      return res.data?.data || res.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  async function updateItem(id, data) {
    actionLoading.value = true
    error.value = null
    try {
      const res = await patientService.update(id, data)
      return res.data?.data || res.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  async function removeItem(id) {
    actionLoading.value = true
    error.value = null
    try {
      await patientService.delete(id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  return {
    items,
    currentPatient,
    stats,
    loading,
    actionLoading,
    error,
    pagination,
    totalItems,
    fetchItems,
    fetchStats,
    fetchItem,
    createItem,
    updateItem,
    removeItem,
  }
})
