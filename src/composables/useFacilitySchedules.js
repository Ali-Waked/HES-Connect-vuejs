import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import * as facilityScheduleService from '@/services/facilityScheduleService'

export function useFacilitySchedules() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const schedules = ref([])
  const pagination = ref({
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 15,
    to: 0,
    total: 0,
  })

  const staffList = ref([])

  let _lastParams = {}

  async function fetchSchedules(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await facilityScheduleService.getStaffSchedules(params)
      schedules.value = data.data || []
      if (data.meta) {
        pagination.value = {
          current_page: data.meta.current_page || 1,
          from: data.meta.from || 0,
          last_page: data.meta.last_page || 1,
          per_page: data.meta.per_page || 15,
          to: data.meta.to || 0,
          total: data.meta.total || 0,
        }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load schedules'
      schedules.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchStaffLookup() {
    try {
      const { data } = await facilityScheduleService.getStaffLookup()
      // console.log(data.data);
      staffList.value = data.data?.staff || data.data || []
    } catch {
      staffList.value = []
    }
  }

  async function createSchedule(formData) {
    saving.value = true
    try {
      await facilityScheduleService.createStaffSchedule(formData)
      store.addToast(t('schedules.created') || 'Schedule created successfully', 'success')
      await fetchSchedules(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create schedule'
      store.addToast(msg, 'error')
      return { success: false, error: msg, errors: err.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  async function updateSchedule(scheduleUuid, formData) {
    saving.value = true
    try {
      await facilityScheduleService.updateStaffSchedule(scheduleUuid, formData)
      store.addToast(t('schedules.updated') || 'Schedule updated successfully', 'success')
      await fetchSchedules(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update schedule'
      store.addToast(msg, 'error')
      return { success: false, error: msg, errors: err.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  async function deleteSchedule(scheduleUuid) {
    try {
      await facilityScheduleService.deleteStaffSchedule(scheduleUuid)
      store.addToast(t('schedules.deleted') || 'Schedule deleted successfully', 'success')
      await fetchSchedules(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete schedule'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    loading,
    error,
    saving,
    schedules,
    pagination,
    staffList,
    fetchSchedules,
    fetchStaffLookup,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
}
