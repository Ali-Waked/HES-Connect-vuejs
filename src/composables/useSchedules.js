import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as scheduleService from '@/services/scheduleService'

export function useSchedules({ toast: toastFn } = {}) {
  const dashboardStore = useDashboardStore()
  const { t } = useI18n()

  function notify(msg, type = 'success') {
    if (toastFn) toastFn(msg, type)
    else dashboardStore.addToast(msg, type)
  }

  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const schedules = ref([])
  const calendarEvents = ref([])
  const currentMonth = ref(new Date())

  let _lastParams = {}

  async function fetchSchedules(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await scheduleService.getSchedules(_lastParams)
      schedules.value = data.schedules || data.data || (Array.isArray(data) ? data : [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load schedules'
      error.value = msg
      notify(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  async function fetchCalendarEvents(params = {}) {
    try {
      const { data } = await scheduleService.getCalendarEvents({
        month: currentMonth.value.getMonth() + 1,
        year: currentMonth.value.getFullYear(),
        ...params
      })
      calendarEvents.value = data.data || data
    } catch {
      calendarEvents.value = []
    }
  }

  async function createSchedule(formData) {
    saving.value = true
    const optimistic = {
      id: 'temp-' + Date.now(),
      ...formData,
      is_active: true
    }
    schedules.value.push(optimistic)
    try {
      const { data } = await scheduleService.createSchedule(formData)
      const idx = schedules.value.findIndex(s => s.id === optimistic.id)
      if (idx !== -1) schedules.value[idx] = data.data || data
      notify('Schedule created successfully', 'success')
      return { success: true }
    } catch (err) {
      schedules.value = schedules.value.filter(s => s.id !== optimistic.id)
      const msg = err.response?.data?.message || 'Failed to create schedule'
      notify(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateSchedule(id, formData) {
    saving.value = true
    const original = schedules.value.find(s => s.id === id)
    if (original) Object.assign(original, { ...formData, _updating: true })
    try {
      const { data } = await scheduleService.updateSchedule(id, formData)
      const idx = schedules.value.findIndex(s => s.id === id)
      if (idx !== -1) schedules.value[idx] = data.data || data
      notify('Schedule updated successfully', 'success')
      return { success: true }
    } catch (err) {
      if (original) {
        const idx = schedules.value.findIndex(s => s.id === id)
        if (idx !== -1) schedules.value[idx] = original
      }
      const msg = err.response?.data?.message || 'Failed to update schedule'
      notify(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
      if (original) delete original._updating
    }
  }

  async function deleteSchedule(id) {
    const original = schedules.value.find(s => s.id === id)
    schedules.value = schedules.value.filter(s => s.id !== id)
    try {
      await scheduleService.deleteSchedule(id)
      notify('Schedule deleted', 'success')
      return { success: true }
    } catch (err) {
      if (original) schedules.value.push(original)
      const msg = err.response?.data?.message || 'Failed to delete schedule'
      notify(msg, 'error')
      return { success: false, error: msg }
    }
  }

  async function toggleScheduleStatus(id, isActive) {
    saving.value = true
    const original = schedules.value.find(s => s.id === id)
    if (original) original.is_active = isActive
    try {
      await scheduleService.updateSchedule(id, { is_active: isActive })
      notify(isActive ? 'Schedule enabled' : 'Schedule disabled', 'success')
      return { success: true }
    } catch (err) {
      if (original) original.is_active = !isActive
      notify('Failed to update status', 'error')
      return { success: false }
    } finally {
      saving.value = false
    }
  }

  const weekDays = computed(() => {
    const start = new Date(currentMonth.value)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })
  })

  useRefetchOnLanguageChange(() => {
    fetchSchedules(_lastParams)
    fetchCalendarEvents()
  })

  return {
    schedules,
    calendarEvents,
    loading,
    saving,
    error,
    currentMonth,
    weekDays,
    fetchSchedules,
    fetchCalendarEvents,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleScheduleStatus,
  }
}
