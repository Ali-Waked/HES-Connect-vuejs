import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as staffService from '@/services/staffService'

export function useStaff() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const staff = ref([])
  const pagination = ref({})

  let _lastParams = {}

  async function fetchStaff(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await staffService.getStaff(params)
      staff.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load staff'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchStaff(_lastParams))

  return {
    staff,
    loading,
    error,
    saving,
    pagination,
    fetchStaff,
  }
}
