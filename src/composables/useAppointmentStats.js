import { ref, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import { getAppointmentStats } from '@/services/appointmentService'

export function useAppointmentStats() {
  const workspaceStore = useWorkspaceStore()

  const loading = ref(false)
  const error = ref(null)
  const stats = ref({
    total: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
    rescheduled: 0,
  })

  let _pollTimer = null

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      const { data } = await getAppointmentStats()
      const d = data.data || data
      stats.value = {
        total: d.total ?? 0,
        today: d.today ?? 0,
        upcoming: d.upcoming ?? 0,
        completed: d.completed ?? 0,
        cancelled: d.cancelled ?? 0,
        no_show: d.no_show ?? 0,
        rescheduled: d.rescheduled ?? 0,
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load stats'
      stats.value = { total: 0, today: 0, upcoming: 0, completed: 0, cancelled: 0, no_show: 0, rescheduled: 0 }
    } finally {
      loading.value = false
    }
  }

  function startPolling(interval = 60000) {
    stopPolling()
    _pollTimer = setInterval(fetchStats, interval)
  }

  function stopPolling() {
    if (_pollTimer) {
      clearInterval(_pollTimer)
      _pollTimer = null
    }
  }

  watch(() => workspaceStore.currentWorkspaceId, () => {
    stats.value = { total: 0, today: 0, upcoming: 0, completed: 0, cancelled: 0, no_show: 0, rescheduled: 0 }
    fetchStats()
  })

  useRefetchOnLanguageChange(fetchStats)

  return {
    stats,
    loading,
    error,
    fetchStats,
    startPolling,
    stopPolling,
  }
}
