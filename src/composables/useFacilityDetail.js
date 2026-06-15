import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as facilityService from '@/services/public/facilityService'

export function useFacilityDetail(uuid) {
  const router = useRouter()
  const facility = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const notFound = ref(false)

  async function fetchFacility() {
    loading.value = true
    error.value = null
    notFound.value = false
    try {
      const { data } = await facilityService.getFacilityDetail(uuid)
      const facilityData = data?.data || data
      if (!facilityData) {
        notFound.value = true
        return
      }
      facility.value = facilityData
    } catch (err) {
      if (err.response?.status === 404) notFound.value = true
      else error.value = err.response?.data?.message || 'Failed to load facility'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchFacility)

  return { facility, loading, error, notFound, fetchFacility }
}
