import { ref, reactive, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { getMyAppointments, cancelMyAppointment } from '@/services/appointmentService'

export function usePatientAppointments() {
  const workspaceStore = useWorkspaceStore()
  const appointments = ref([])
  const loading = ref(false)
  const error = ref('')
  const statusFilter = ref('')
  const searchQuery = ref('')
  const pagination = reactive({
    current_page: 1,
    last_page: 1,
    total: 0,
  })

  async function fetchAppointments() {
    loading.value = true
    error.value = ''
    try {
      const params = { page: pagination.current_page, per_page: 10 }
      if (statusFilter.value) params.status = statusFilter.value
      if (searchQuery.value) params.search = searchQuery.value
      const { data } = await getMyAppointments(params)
      appointments.value = data.data || data || []
      if (data.meta) {
        pagination.current_page = data.meta.current_page || 1
        pagination.last_page = Math.ceil((data.meta.total || 0) / (data.meta.per_page || 10))
        pagination.total = data.meta.total || 0
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load appointments'
      error.value = msg
    } finally {
      loading.value = false
    }
  }

  async function cancelAppointment(id) {
    await cancelMyAppointment(id)
    await fetchAppointments()
  }

  function setPage(page) {
    pagination.current_page = page
    fetchAppointments()
  }

  function setStatusFilter(status) {
    statusFilter.value = status
    pagination.current_page = 1
    fetchAppointments()
  }

  function setSearchQuery(query) {
    searchQuery.value = query
    pagination.current_page = 1
    fetchAppointments()
  }

  watch(() => workspaceStore.currentWorkspaceId, () => {
    appointments.value = []
    error.value = ''
    statusFilter.value = ''
    searchQuery.value = ''
    pagination.current_page = 1
    pagination.last_page = 1
    pagination.total = 0
  })

  return {
    appointments,
    loading,
    error,
    statusFilter,
    searchQuery,
    pagination,
    fetchAppointments,
    cancelAppointment,
    setPage,
    setStatusFilter,
    setSearchQuery,
  }
}
