import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as appointmentService from '@/services/appointmentService'

export function useAppointments() {
  const store = useDashboardStore()
  const workspaceStore = useWorkspaceStore()
  const { can } = useAuthPermissions()
  const { t } = useI18n()

  const loading = ref(false)
  const saving = ref(false)
  const appointments = ref([])
  const selectedAppointment = ref(null)
  const error = ref(null)
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
    date_from: '',
    date_to: '',
    staff_uuid: '',
    sort_field: 'scheduled_at',
    sort_direction: 'desc',
  })

  let _lastParams = {}

  const showStaffFilter = computed(() => {
    return can('view_appointments')
  })

  const queryParams = computed(() => ({
    page: pagination.value.current_page,
    per_page: pagination.value.per_page,
    search: filters.value.search || undefined,
    status: filters.value.status || undefined,
    date_from: filters.value.date_from || undefined,
    date_to: filters.value.date_to || undefined,
    staff_uuid: (showStaffFilter.value && filters.value.staff_uuid) ? filters.value.staff_uuid : undefined,
    sort_field: filters.value.sort_field,
    sort_direction: filters.value.sort_direction,
  }))

  async function fetchAppointments(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = { ...queryParams.value, ...params }
    try {
      const { data } = await appointmentService.getAppointments(_lastParams)
      appointments.value = data.data || []
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
      const msg = err.response?.data?.message || 'Failed to load appointments'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  async function fetchAppointment(uuid) {
    try {
      const { data } = await appointmentService.getAppointment(uuid)
      selectedAppointment.value = data.data || data
      return selectedAppointment.value
    } catch (err) {
      store.addToast('Failed to load appointment details', 'error')
      return null
    }
  }

  async function fetchFacilityStaff() {
    if (!showStaffFilter.value) return
    try {
      const { data } = await appointmentService.getFacilityStaff()
      facilityStaff.value = data.data || data || []
    } catch {
      facilityStaff.value = []
    }
  }

  async function cancelAppointment(uuid, reason = '') {
    saving.value = true
    const original = appointments.value.find(a => (a.uuid || a.id) === uuid)
    if (original) original._status = original.status
    try {
      await appointmentService.cancelAppointment(uuid, { reason })
      store.addToast('Appointment cancelled successfully', 'success')
      if (original) original.status = 'cancelled'
      if (selectedAppointment.value?.uuid === uuid) selectedAppointment.value.status = 'cancelled'
      return { success: true }
    } catch (err) {
      if (original && original._status) original.status = original._status
      store.addToast(err.response?.data?.message || 'Failed to cancel appointment', 'error')
      return { success: false }
    } finally {
      saving.value = false
      if (original) delete original._status
    }
  }

  async function restoreAppointment(uuid) {
    saving.value = true
    try {
      await appointmentService.restoreAppointment(uuid)
      store.addToast('Appointment restored successfully', 'success')
      await fetchAppointments()
      return { success: true }
    } catch (err) {
      store.addToast('Failed to restore appointment', 'error')
      return { success: false }
    } finally {
      saving.value = false
    }
  }

  async function forceCompleteAppointment(uuid) {
    saving.value = true
    try {
      await appointmentService.forceCompleteAppointment(uuid)
      store.addToast('Appointment force completed', 'success')
      if (selectedAppointment.value?.uuid === uuid) selectedAppointment.value.status = 'completed'
      await fetchAppointments()
      return { success: true }
    } catch (err) {
      store.addToast('Failed to complete appointment', 'error')
      return { success: false }
    } finally {
      saving.value = false
    }
  }

  function setPage(page) {
    pagination.value.current_page = page
    fetchAppointments()
  }

  function setPerPage(value) {
    pagination.value.per_page = value
    pagination.value.current_page = 1
    fetchAppointments()
  }

  function setFilter(key, value) {
    filters.value[key] = value
    pagination.value.current_page = 1
    fetchAppointments()
  }

  function toggleSort(field) {
    if (filters.value.sort_field === field) {
      filters.value.sort_direction = filters.value.sort_direction === 'asc' ? 'desc' : 'asc'
    } else {
      filters.value.sort_field = field
      filters.value.sort_direction = 'asc'
    }
    pagination.value.current_page = 1
    fetchAppointments()
  }

  function resetFilters() {
    filters.value = {
      search: '',
      status: '',
      date_from: '',
      date_to: '',
      staff_uuid: '',
      sort_field: 'scheduled_at',
      sort_direction: 'desc',
    }
    pagination.value.current_page = 1
    fetchAppointments()
  }

  const hasActiveFilters = computed(() => {
    return Object.entries(filters.value).some(([k, v]) =>
      !['sort_field', 'sort_direction'].includes(k) && v
    )
  })

  watch(() => workspaceStore.currentWorkspaceId, () => {
    appointments.value = []
    selectedAppointment.value = null
    facilityStaff.value = []
    error.value = null
    pagination.value.current_page = 1
    resetFilters()
  })

  useRefetchOnLanguageChange(() => fetchAppointments(_lastParams))

  return {
    appointments,
    loading,
    saving,
    error,
    pagination,
    filters,
    selectedAppointment,
    facilityStaff,
    showStaffFilter,
    hasActiveFilters,
    queryParams,
    fetchAppointments,
    fetchAppointment,
    fetchFacilityStaff,
    cancelAppointment,
    restoreAppointment,
    forceCompleteAppointment,
    setPage,
    setPerPage,
    setFilter,
    toggleSort,
    resetFilters,
  }
}
