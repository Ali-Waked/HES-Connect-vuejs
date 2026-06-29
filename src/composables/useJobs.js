import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as jobService from '@/services/dashboard/jobService'

export function useJobs() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const jobs = ref([])
  const pagination = ref({})
  const stats = ref(null)
  const statsLoading = ref(false)

  let _lastParams = {}

  async function fetchJobs(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await jobService.getJobs(params)
      jobs.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load jobs'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchJobs(_lastParams))

  async function fetchJobStats() {
    statsLoading.value = true
    try {
      const { data } = await jobService.getJobStats()
      stats.value = data
    } catch {
      // silently fail for stats
    } finally {
      statsLoading.value = false
    }
  }

  async function createJob(formData) {
    saving.value = true
    try {
      await jobService.createJob(formData)
      store.addToast(t('jobs.created') || 'Job post created successfully', 'success')
      await fetchJobs(_lastParams)
      await fetchJobStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create job post'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateJob(id, formData) {
    saving.value = true
    try {
      await jobService.updateJob(id, formData)
      store.addToast(t('jobs.updated') || 'Job post updated successfully', 'success')
      await fetchJobs(_lastParams)
      await fetchJobStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update job post'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteJob(id) {
    try {
      await jobService.deleteJob(id)
      store.addToast('Job post deleted successfully', 'success')
      if (jobs.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchJobs(_lastParams)
      await fetchJobStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete job post'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  async function updateJobStatus(id, status) {
    try {
      if (status === 'approved') {
        await jobService.approveJob(id)
      } else if (status === 'rejected') {
        await jobService.rejectJob(id)
      }
      store.addToast(t('jobs.updated') || 'Job status updated', 'success')
      await fetchJobs(_lastParams)
      await fetchJobStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    jobs,
    loading,
    error,
    saving,
    pagination,
    stats,
    statsLoading,
    fetchJobs,
    fetchJobStats,
    createJob,
    updateJob,
    deleteJob,
    updateJobStatus,
  }
}
