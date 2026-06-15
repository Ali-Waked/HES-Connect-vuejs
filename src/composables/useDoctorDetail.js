import { ref, onMounted } from 'vue'
import * as doctorService from '@/services/public/doctorService'

export function useDoctorDetail(uuid) {
  const doctor = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const notFound = ref(false)

  async function fetchDoctor() {
    loading.value = true
    error.value = null
    notFound.value = false
    try {
      const { data } = await doctorService.getDoctorDetail(uuid)
      const doctorData = data?.data || data
      if (!doctorData) {
        notFound.value = true
        return
      }
      doctor.value = doctorData
    } catch (err) {
      if (err.response?.status === 404) notFound.value = true
      else error.value = err.response?.data?.message || 'Failed to load doctor'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchDoctor)

  return { doctor, loading, error, notFound, fetchDoctor }
}
