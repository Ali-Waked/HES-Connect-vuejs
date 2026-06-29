import { ref } from 'vue'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as jobService from '@/services/public/jobService'

export function usePublicJobDetail(slug) {
  const job = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const notFound = ref(false)

  async function fetchJob() {
    loading.value = true
    error.value = null
    notFound.value = false
    try {
      const { data } = await jobService.getJobDetail(slug)
      job.value = data?.data || data
    } catch (err) {
      if (err.response?.status === 404) {
        notFound.value = true
      } else {
        error.value = err.response?.data?.message || 'Failed to load job post'
      }
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(fetchJob)

  return {
    job,
    loading,
    error,
    notFound,
    fetchJob,
  }
}
