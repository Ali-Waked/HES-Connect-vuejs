import { ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import * as staffFacilityService from '@/services/staffFacilityService'

export function useStaffFacilities() {
  const store = useDashboardStore()
  const facilities = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchFacilities() {
    loading.value = true
    error.value = null
    try {
      const { data } = await staffFacilityService.getStaffFacilities()
      facilities.value = data.data || data || []
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load facilities'
      error.value = msg
      store.addToast(msg, 'error')
      facilities.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    facilities,
    loading,
    error,
    fetchFacilities,
  }
}
