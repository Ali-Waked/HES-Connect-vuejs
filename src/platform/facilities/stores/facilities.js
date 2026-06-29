import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as facilityService from '../services/facilityService'

export const useFacilitiesStore = defineStore('platformFacilities', () => {
  const items = ref([])
  const currentFacility = ref(null)
  const stats = ref({ total: 0, active: 0, pending: 0, suspended: 0 })
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
  })

  const totalItems = computed(() => pagination.value.total)

  async function fetchItems(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await facilityService.list(params)
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
      error.value = err.message || 'Failed to load facilities.'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const res = await facilityService.getFacilityStats()
      stats.value = res.data?.data || res.data || stats.value
    } catch {
      /* silently fail */
    }
  }

  async function fetchItem(id) {
    loading.value = true
    error.value = null
    try {
      const res = await facilityService.get(id)
      currentFacility.value = res.data?.data || res.data
    } catch (err) {
      error.value = err.message || 'Failed to load facility.'
      currentFacility.value = null
    } finally {
      loading.value = false
    }
  }

  async function createItem(data) {
    actionLoading.value = true
    error.value = null
    try {
      const res = await facilityService.create(data)
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
      const res = await facilityService.update(id, data)
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
      await facilityService.delete(id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  return {
    items,
    currentFacility,
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
