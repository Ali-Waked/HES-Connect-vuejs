import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStaffStore } from '@/stores/useStaffStore'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as facilityJobService from '@/services/facilityJobService'

export function useFacilityJobs() {
  const store = useStaffStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const jobPosts = ref([])
  const pagination = ref({})
  const stats = ref(null)
  const statsLoading = ref(false)

  let _lastParams = {}

  async function fetchJobPosts(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await facilityJobService.getJobPosts(params)
      jobPosts.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load job posts'
      error.value = msg
      store.showToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchJobPosts(_lastParams))

  async function fetchJobPostStats() {
    statsLoading.value = true
    try {
      const { data } = await facilityJobService.getJobPostStats()
      stats.value = data
    } catch {
      // silently fail for stats
    } finally {
      statsLoading.value = false
    }
  }

  async function createJobPost(formData) {
    saving.value = true
    try {
      await facilityJobService.createJobPost(formData)
      store.showToast('Job post created successfully', 'success')
      await fetchJobPosts(_lastParams)
      await fetchJobPostStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create job post'
      store.showToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateJobPost(id, formData) {
    saving.value = true
    try {
      await facilityJobService.updateJobPost(id, formData)
      store.showToast('Job post updated successfully', 'success')
      await fetchJobPosts(_lastParams)
      await fetchJobPostStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update job post'
      store.showToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteJobPost(id) {
    try {
      await facilityJobService.deleteJobPost(id)
      store.showToast('Job post deleted successfully', 'success')
      if (jobPosts.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchJobPosts(_lastParams)
      await fetchJobPostStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete job post'
      store.showToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    jobPosts,
    loading,
    error,
    saving,
    pagination,
    stats,
    statsLoading,
    fetchJobPosts,
    fetchJobPostStats,
    createJobPost,
    updateJobPost,
    deleteJobPost,
  }
}
