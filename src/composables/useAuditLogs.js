import { ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as auditLogService from '@/services/auditLogService'

export function useAuditLogs() {
  const store = useDashboardStore()

  const loading = ref(false)
  const error = ref(null)
  const logs = ref([])
  const meta = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })

  const filters = ref({
    page: 1,
    per_page: 15,
    action: '',
    table_name: '',
    date_from: '',
    date_to: '',
  })

  let _lastParams = {}

  async function fetchLogs(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = { ...filters.value, ...params }
    try {
      const { data } = await auditLogService.getAuditLogs(_lastParams)
      logs.value = data.data || []
      meta.value = {
        current_page: data.meta?.current_page || 1,
        last_page: data.meta?.last_page || 1,
        per_page: data.meta?.per_page || 15,
        total: data.meta?.total || 0,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load audit logs'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  function setPage(page) {
    filters.value.page = page
    fetchLogs()
  }

  function setFilter(key, value) {
    filters.value[key] = value
    filters.value.page = 1
    fetchLogs()
  }

  function resetFilters() {
    filters.value = { page: 1, per_page: 15, action: '', table_name: '', date_from: '', date_to: '' }
    fetchLogs()
  }

  useRefetchOnLanguageChange(() => fetchLogs(_lastParams))

  return {
    logs,
    loading,
    error,
    meta,
    filters,
    fetchLogs,
    setPage,
    setFilter,
    resetFilters,
  }
}
