import { ref, computed, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as patientService from '@/services/patientService'
import { getFacilityStaff } from '@/services/appointmentService'

export function usePatients() {
  const store = useDashboardStore()
  const workspaceStore = useWorkspaceStore()
  const { can, isFacilityManager, currentRoleSlug } = useAuthPermissions()

  const loading = ref(false)
  const error = ref(null)
  const patients = ref([])
  const facilityStaff = ref([])

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
    staff_uuid: '',
  })

  const showStaffFilter = computed(() => {
    return can('patients.view-all') || isFacilityManager() || currentRoleSlug.value === 'facility_owner'
  })

  const hasActiveFilters = computed(() => {
    return Object.entries(filters.value).some(([, v]) => v)
  })

  const queryParams = computed(() => ({
    page: pagination.value.current_page,
    per_page: pagination.value.per_page,
    search: filters.value.search || undefined,
    status: filters.value.status || undefined,
    facility_staff_id: (showStaffFilter.value && filters.value.staff_uuid) ? filters.value.staff_uuid : undefined,
  }))

  let _lastParams = {}

  async function fetchPatients(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = { ...queryParams.value, ...params }
    try {
      const { data } = await patientService.getPatients(_lastParams)
      const payload = data.data || data || []
      patients.value = Array.isArray(payload) ? payload : []
      const page = data.meta || data
      pagination.value = {
        current_page: page.current_page || 1,
        last_page: page.last_page || 1,
        per_page: page.per_page || 10,
        total: page.total || 0,
        from: page.from || 0,
        to: page.to || 0,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load patients'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  async function fetchFacilityStaff() {
    if (!showStaffFilter.value) return
    try {
      const { data } = await getFacilityStaff()
      facilityStaff.value = data.data || data || []
    } catch {
      facilityStaff.value = []
    }
  }

  function setPage(page) {
    pagination.value.current_page = page
    fetchPatients()
  }

  function setPerPage(value) {
    pagination.value.per_page = value
    pagination.value.current_page = 1
    fetchPatients()
  }

  function setFilter(key, value) {
    filters.value[key] = value
    pagination.value.current_page = 1
    fetchPatients()
  }

  function resetFilters() {
    filters.value = { search: '', status: '', staff_uuid: '' }
    pagination.value.current_page = 1
    fetchPatients()
  }

  watch(() => workspaceStore.currentWorkspaceId, () => {
    patients.value = []
    facilityStaff.value = []
    error.value = null
    pagination.value.current_page = 1
    resetFilters()
  })

  useRefetchOnLanguageChange(() => fetchPatients(_lastParams))

  return {
    patients,
    loading,
    error,
    pagination,
    filters,
    facilityStaff,
    showStaffFilter,
    hasActiveFilters,
    fetchPatients,
    fetchFacilityStaff,
    setPage,
    setPerPage,
    setFilter,
    resetFilters,
  }
}
