import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import * as facilityUnavailabilityService from '@/services/facilityUnavailabilityService'

export function useFacilityUnavailability() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const requests = ref([])
  const pagination = ref({
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 15,
    to: 0,
    total: 0,
  })

  const stats = ref({
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  })

  let _lastParams = {}

  async function fetchRequests(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await facilityUnavailabilityService.getUnavailabilityRequests(params)
      requests.value = data.data || []
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
      if (data.stats) {
        stats.value = data.stats
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load unavailability requests'
      requests.value = []
    } finally {
      loading.value = false
    }
  }

  async function approveRequest(uuid, notes = '') {
    saving.value = true
    try {
      await facilityUnavailabilityService.approveUnavailabilityRequest(uuid, { notes })
      store.addToast(t('unavailability.approved') || 'Request approved successfully', 'success')
      await fetchRequests(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve request'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function rejectRequest(uuid, notes = '') {
    saving.value = true
    try {
      await facilityUnavailabilityService.rejectUnavailabilityRequest(uuid, { notes })
      store.addToast(t('unavailability.rejected') || 'Request rejected successfully', 'success')
      await fetchRequests(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject request'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  return {
    loading,
    error,
    saving,
    requests,
    pagination,
    stats,
    fetchRequests,
    approveRequest,
    rejectRequest,
  }
}
