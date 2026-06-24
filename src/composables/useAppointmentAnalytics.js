import { ref, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useWorkspaceStore } from '@/stores/workspace'
import { resolveTranslatedValue } from '@/utils/locale'
import * as appointmentService from '@/services/appointmentService'

export function useAppointmentAnalytics() {
  const store = useDashboardStore()
  const workspaceStore = useWorkspaceStore()

  const loading = ref(false)
  const stats = ref(null)
  const trends = ref(null)
  const distribution = ref(null)
  const topFacilities = ref([])
  const topDoctors = ref([])

  async function fetchStats(params = {}) {
    loading.value = true
    try {
      const { data } = await appointmentService.getAppointmentStats(params)
      stats.value = data.data || data
    } catch {
      stats.value = {
        total: 0,
        today: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
        rescheduled: 0,
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchAnalytics(params = {}) {
    loading.value = true
    try {
      const { data } = await appointmentService.getAppointmentAnalytics(params)
      const d = data.data || data

      const daily = d.trends?.daily || []
      const seriesData = daily
        .filter(item => item.date != null)
        .map(item => ({ x: new Date(item.date).getTime(), y: item.total }))
      trends.value = seriesData.length
        ? [{ name: 'Appointments', data: seriesData }]
        : []

      topFacilities.value = (d.facility_performance || []).map(f => ({
        name: resolveTranslatedValue(f.facility?.name),
        count: f.appointments_count,
        completion_rate: f.completion_rate,
        cancellation_rate: f.cancellation_rate,
      }))

      topDoctors.value = (d.doctor_performance || []).map(doc => ({
        name: resolveTranslatedValue(doc.doctor?.name),
        count: doc.appointments_count,
        patients_count: doc.patients_count,
        completion_rate: doc.completion_rate,
      }))

      distribution.value = []
    } catch {
      trends.value = []
      distribution.value = []
      topFacilities.value = []
      topDoctors.value = []
    } finally {
      loading.value = false
    }
  }

  watch(() => workspaceStore.currentWorkspaceId, () => {
    stats.value = null
    trends.value = null
    distribution.value = null
    topFacilities.value = []
    topDoctors.value = []
  })

  return {
    loading,
    stats,
    trends,
    distribution,
    topFacilities,
    topDoctors,
    fetchStats,
    fetchAnalytics,
  }
}
