import { ref, computed, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useWorkspaceStore } from '@/stores/workspace'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as medicationRequestService from '@/services/medicationRequestService'

export function useMedicationRequests(role = 'admin') {
  const store = useDashboardStore()
  const workspaceStore = useWorkspaceStore()

  const loading = ref(false)
  const error = ref(null)
  const requests = ref([])

  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  })

  const filters = ref({
    search: '',
    status: '',
  })

  const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(v => v)
  })

  const queryParams = computed(() => ({
    page: pagination.value.current_page,
    per_page: pagination.value.per_page,
    search: filters.value.search || undefined,
    status: filters.value.status || undefined,
  }))

  let _lastParams = {}

  async function fetchRequests(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = { ...queryParams.value, ...params }
    try {
      const fn = role === 'admin'
        ? medicationRequestService.getAdminMedicationRequests
        : medicationRequestService.getFacilityMedicationRequests
      const { data } = await fn(_lastParams)
      requests.value = data.data || []
      if (data.meta) {
        pagination.value = {
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
          from: data.meta.from || 0,
          to: data.meta.to || 0,
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load medication requests'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  function setPage(page) {
    pagination.value.current_page = page
    fetchRequests()
  }

  function setFilter(key, value) {
    filters.value[key] = value
    pagination.value.current_page = 1
    fetchRequests()
  }

  function resetFilters() {
    filters.value = { search: '', status: '' }
    pagination.value.current_page = 1
    fetchRequests()
  }

  watch(() => workspaceStore.currentWorkspaceId, () => {
    requests.value = []
    error.value = null
    pagination.value.current_page = 1
    resetFilters()
  })

  useRefetchOnLanguageChange(() => fetchRequests(_lastParams))

  return {
    requests,
    loading,
    error,
    pagination,
    filters,
    hasActiveFilters,
    queryParams,
    fetchRequests,
    setPage,
    setFilter,
    resetFilters,
  }
}
