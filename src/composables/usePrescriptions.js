import { ref, computed, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useWorkspaceStore } from '@/stores/workspace'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as prescriptionsService from '@/services/prescriptions'

export function usePrescriptions(role = 'admin') {
  const store = useDashboardStore()
  const workspaceStore = useWorkspaceStore()

  const loading = ref(false)
  const error = ref(null)
  const prescriptions = ref([])
  const selectedPrescription = ref(null)

  const analytics = ref({
    total: 0,
    active: 0,
    dispensed: 0,
    cancelled: 0,
  })

  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  })

  const filters = ref({
    search: '',
    status: '',
    date_from: '',
    date_to: '',
  })

  const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(v => v)
  })

  const queryParams = computed(() => ({
    page: pagination.value.current_page,
    per_page: pagination.value.per_page,
    search: filters.value.search || undefined,
    status: filters.value.status || undefined,
    date_from: filters.value.date_from || undefined,
    date_to: filters.value.date_to || undefined,
  }))

  let _lastParams = {}

  async function fetchPrescriptions(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = { ...queryParams.value, ...params }
    try {
      const fn = role === 'admin' ? prescriptionsService.getAdminPrescriptions
        : role === 'facility_owner' ? prescriptionsService.getFacilityOwnerPrescriptions
        : role === 'doctor' ? prescriptionsService.getDoctorPrescriptions
        : prescriptionsService.getAdminPrescriptions
      const { data } = await fn(_lastParams)
      prescriptions.value = data.data || []
      if (data.meta) {
        pagination.value = {
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
          from: data.meta.from,
          to: data.meta.to,
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load prescriptions'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  async function fetchAnalytics(params = {}) {
    try {
      const fn = role === 'admin' ? prescriptionsService.getAdminPrescriptionAnalytics
        : role === 'facility_owner' ? prescriptionsService.getFacilityOwnerPrescriptionAnalytics
        : prescriptionsService.getAdminPrescriptionAnalytics
      const { data } = await fn(params)
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

  async function loadAll(params = {}) {
    await Promise.all([fetchPrescriptions(params), fetchAnalytics(params)])
  }

  async function fetchPrescription(uuid) {
    try {
      const fn = role === 'admin' ? prescriptionsService.getAdminPrescription
        : role === 'facility_owner' ? prescriptionsService.getFacilityOwnerPrescription
        : role === 'doctor' ? prescriptionsService.getDoctorPrescription
        : prescriptionsService.getAdminPrescription
      const { data } = await fn(uuid)
      selectedPrescription.value = data.data || data
      return selectedPrescription.value
    } catch (err) {
      store.addToast('Failed to load prescription details', 'error')
      return null
    }
  }

  function setPage(page) {
    pagination.value.current_page = page
    fetchPrescriptions()
  }

  function setPerPage(value) {
    pagination.value.per_page = value
    pagination.value.current_page = 1
    fetchPrescriptions()
  }

  function setFilter(key, value) {
    filters.value[key] = value
    pagination.value.current_page = 1
    fetchPrescriptions()
  }

  function resetFilters() {
    filters.value = { search: '', status: '', date_from: '', date_to: '' }
    pagination.value.current_page = 1
    fetchPrescriptions()
  }

  watch(() => workspaceStore.currentWorkspaceId, () => {
    prescriptions.value = []
    selectedPrescription.value = null
    error.value = null
    pagination.value.current_page = 1
    resetFilters()
  })

  useRefetchOnLanguageChange(() => fetchPrescriptions(_lastParams))

  return {
    prescriptions,
    loading,
    error,
    pagination,
    filters,
    analytics,
    selectedPrescription,
    hasActiveFilters,
    queryParams,
    fetchPrescriptions,
    fetchAnalytics,
    fetchPrescription,
    loadAll,
    setPage,
    setPerPage,
    setFilter,
    resetFilters,
  }
}
