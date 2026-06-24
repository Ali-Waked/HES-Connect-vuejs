import { defineStore } from 'pinia'
import { ref, reactive, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import {
  getDashboard,
  getLiveAppointments,
  getDoctorsPerformance,
  getPatientsOverview,
  getSchedules,
  getAnalytics,
  getAlerts,
  getStaff
} from '@/services/facility-dashboard.service'

function unwrap(res) {
  return res.data?.data ?? res.data
}

export const useFacilityDashboardStore = defineStore('facilityDashboard', () => {

  const dashboard = reactive({
    total_appointments_today: 0,
    total_appointments_month: 0,
    completed_appointments: 0,
    cancelled_appointments: 0,
    active_doctors_count: 0,
    total_patients_count: 0,
    revenue_total: 0
  })

  const liveAppointments = ref([])
  const doctorsPerformance = ref([])
  const patientsOverview = reactive({
    total: 0,
    new: 0,
    returning: 0,
    top_patients: []
  })
  const schedules = ref([])
  const analytics = reactive({
    appointments_per_day: [],
    peak_hours: [],
    cancellation_trends: []
  })
  const alerts = ref([])
  const staff = ref([])

  const loading = reactive({
    all: false,
    dashboard: true,
    liveAppointments: true,
    doctors: true,
    patients: true,
    schedules: true,
    analytics: true,
    alerts: true,
    staff: true
  })

  const errors = reactive({
    dashboard: null,
    liveAppointments: null,
    doctors: null,
    patients: null,
    schedules: null,
    analytics: null,
    alerts: null,
    staff: null
  })

  const toasts = ref([])
  let toastId = 0

  function addToast(message, type = 'success') {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 4000)
  }

  async function fetchDashboard() {
    loading.dashboard = true
    errors.dashboard = null
    try {
      const res = await getDashboard()
      const d = unwrap(res)
      dashboard.total_appointments_today = d.total_appointments_today ?? 0
      dashboard.total_appointments_month = d.total_appointments_month ?? 0
      dashboard.completed_appointments = d.completed_appointments ?? 0
      dashboard.cancelled_appointments = d.cancelled_appointments ?? 0
      dashboard.active_doctors_count = d.active_doctors_count ?? 0
      dashboard.total_patients_count = d.total_patients_count ?? 0
      dashboard.revenue_total = d.revenue_total ?? 0
    } catch (err) {
      errors.dashboard = err.response?.data?.message || err.message || 'Failed to load dashboard data'
      addToast(errors.dashboard, 'error')
    } finally {
      loading.dashboard = false
    }
  }

  async function fetchLiveAppointments() {
    loading.liveAppointments = true
    errors.liveAppointments = null
    try {
      const res = await getLiveAppointments()
      liveAppointments.value = unwrap(res) || []
    } catch (err) {
      errors.liveAppointments = err.response?.data?.message || err.message || 'Failed to load live appointments'
      liveAppointments.value = []
      addToast(errors.liveAppointments, 'error')
    } finally {
      loading.liveAppointments = false
    }
  }

  async function fetchDoctorsPerformance() {
    loading.doctors = true
    errors.doctors = null
    try {
      const res = await getDoctorsPerformance()
      doctorsPerformance.value = unwrap(res) || []
    } catch (err) {
      errors.doctors = err.response?.data?.message || err.message || 'Failed to load doctors performance'
      doctorsPerformance.value = []
      addToast(errors.doctors, 'error')
    } finally {
      loading.doctors = false
    }
  }

  async function fetchPatientsOverview() {
    loading.patients = true
    errors.patients = null
    try {
      const res = await getPatientsOverview()
      const d = unwrap(res)
      patientsOverview.total = d.total ?? 0
      patientsOverview.new = d.new ?? 0
      patientsOverview.returning = d.returning ?? 0
      patientsOverview.top_patients = d.top_patients ?? []
    } catch (err) {
      errors.patients = err.response?.data?.message || err.message || 'Failed to load patients overview'
      patientsOverview.total = 0
      patientsOverview.new = 0
      patientsOverview.returning = 0
      patientsOverview.top_patients = []
      addToast(errors.patients, 'error')
    } finally {
      loading.patients = false
    }
  }

  async function fetchSchedules() {
    loading.schedules = true
    errors.schedules = null
    try {
      const res = await getSchedules()
      schedules.value = unwrap(res) || []
    } catch (err) {
      errors.schedules = err.response?.data?.message || err.message || 'Failed to load schedules'
      schedules.value = []
      addToast(errors.schedules, 'error')
    } finally {
      loading.schedules = false
    }
  }

  async function fetchAnalytics() {
    loading.analytics = true
    errors.analytics = null
    try {
      const res = await getAnalytics()
      const d = unwrap(res)
      analytics.appointments_per_day = d.appointments_per_day ?? []
      analytics.peak_hours = d.peak_hours ?? []
      analytics.cancellation_trends = d.cancellation_trends ?? []
    } catch (err) {
      errors.analytics = err.response?.data?.message || err.message || 'Failed to load analytics'
      analytics.appointments_per_day = []
      analytics.peak_hours = []
      analytics.cancellation_trends = []
      addToast(errors.analytics, 'error')
    } finally {
      loading.analytics = false
    }
  }

  async function fetchAlerts() {
    loading.alerts = true
    errors.alerts = null
    try {
      const res = await getAlerts()
      alerts.value = unwrap(res) || []
    } catch (err) {
      errors.alerts = err.response?.data?.message || err.message || 'Failed to load alerts'
      alerts.value = []
      addToast(errors.alerts, 'error')
    } finally {
      loading.alerts = false
    }
  }

  async function fetchStaff() {
    loading.staff = true
    errors.staff = null
    try {
      const res = await getStaff()
      staff.value = unwrap(res) || []
    } catch (err) {
      errors.staff = err.response?.data?.message || err.message || 'Failed to load staff'
      staff.value = []
      addToast(errors.staff, 'error')
    } finally {
      loading.staff = false
    }
  }

  async function fetchAll() {
    loading.all = true
    try {
      await Promise.all([
        fetchDashboard(),
        fetchLiveAppointments(),
        fetchDoctorsPerformance(),
        fetchPatientsOverview(),
        fetchSchedules(),
        fetchAnalytics(),
        fetchAlerts(),
        fetchStaff()
      ])
    } finally {
      loading.all = false
    }
  }

  const workspaceStore = useWorkspaceStore()
  watch(() => workspaceStore.currentWorkspaceId, () => {
    dashboard.total_appointments_today = 0
    dashboard.total_appointments_month = 0
    dashboard.completed_appointments = 0
    dashboard.cancelled_appointments = 0
    dashboard.active_doctors_count = 0
    dashboard.total_patients_count = 0
    dashboard.revenue_total = 0
    liveAppointments.value = []
    doctorsPerformance.value = []
    patientsOverview.total = 0
    patientsOverview.new = 0
    patientsOverview.returning = 0
    patientsOverview.top_patients = []
    schedules.value = []
    analytics.appointments_per_day = []
    analytics.peak_hours = []
    analytics.cancellation_trends = []
    alerts.value = []
    staff.value = []
    fetchAll()
  })

  return {
    dashboard, liveAppointments, doctorsPerformance, patientsOverview,
    schedules, analytics, alerts, staff,
    loading, errors, toasts, addToast,
    fetchAll, fetchDashboard, fetchLiveAppointments, fetchDoctorsPerformance,
    fetchPatientsOverview, fetchSchedules, fetchAnalytics, fetchAlerts, fetchStaff
  }
})
