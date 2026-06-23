import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { getMedicationAnalytics } from '@/services/medicationAnalyticsService'

function unwrap(res) {
  return res.data?.data ?? res.data
}

export const useAdminMedicationAnalyticsStore = defineStore('adminMedicationAnalytics', () => {
  const analytics = reactive({
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
    approval_rate: 0,
    monthly_trend: [],
    status_distribution: [],
    top_pharmacies: [],
    most_requested_medicines: [],
    recent_requests: [],
  })

  const loading = ref(false)
  const error = ref(null)

  async function fetchAnalytics() {
    loading.value = true
    error.value = null
    try {
      const res = await getMedicationAnalytics()
      const d = unwrap(res)
      analytics.total_requests = d.total_requests ?? 0
      analytics.pending_requests = d.pending_requests ?? 0
      analytics.approved_requests = d.approved_requests ?? 0
      analytics.rejected_requests = d.rejected_requests ?? 0
      analytics.approval_rate = d.approval_rate ?? 0
      analytics.monthly_trend = Array.isArray(d.monthly_trend) ? d.monthly_trend : []
      analytics.status_distribution = Array.isArray(d.status_distribution) ? d.status_distribution : []
      analytics.top_pharmacies = Array.isArray(d.top_pharmacies) ? d.top_pharmacies : []
      analytics.most_requested_medicines = Array.isArray(d.most_requested_medicines) ? d.most_requested_medicines : []
      analytics.recent_requests = Array.isArray(d.recent_requests) ? d.recent_requests : []
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load medication analytics'
    } finally {
      loading.value = false
    }
  }

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  }
})
