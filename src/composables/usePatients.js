import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as patientService from '@/services/patientService'

export function usePatients() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const patients = ref([])
  const pagination = ref({})

  let _lastParams = {}

  async function fetchPatients(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await patientService.getPatients(params)
      patients.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load patients'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchPatients(_lastParams))

  return {
    patients,
    loading,
    error,
    saving,
    pagination,
    fetchPatients,
  }
}
