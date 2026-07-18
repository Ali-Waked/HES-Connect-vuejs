import { ref } from 'vue'
import { getMyFacilities } from '@/services/myFacilitiesService'

export function useMyFacilities() {
  const facilities = ref([])
  const loading = ref(false)

  async function fetchFacilities() {
    loading.value = true
    try {
      const { data } = await getMyFacilities()
      facilities.value = data.data || data || []
    } catch {
      facilities.value = []
    } finally {
      loading.value = false
    }
  }

  return { facilities, loading, fetchFacilities }
}
