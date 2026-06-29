import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as jobService from '@/services/public/jobService'

export function usePublicJobs() {
  const route = useRoute()
  const router = useRouter()

  const loading = ref(true)
  const jobs = ref([])
  const error = ref(null)

  const pagination = ref({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })

  const filters = reactive({
    search: '',
    sort: 'latest',
    page: 1,
  })

  async function fetchJobs() {
    loading.value = true
    try {
      const params = { per_page: 12 }
      if (filters.search) params.search = filters.search
      if (filters.sort && filters.sort !== 'latest') params.sort = filters.sort
      if (filters.page > 1) params.page = filters.page

      const { data } = await jobService.getJobs(params)
      jobs.value = data?.data || []
      pagination.value = data?.meta || { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 }
      error.value = null
    } catch (err) {
      jobs.value = []
      error.value = err.response?.data?.message || 'Failed to load jobs'
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(fetchJobs)

  function setPage(page) {
    if (page < 1 || page > pagination.value.last_page) return
    filters.page = page
    syncQuery()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function updateFilter(key, value) {
    filters[key] = value
    if (key !== 'page') filters.page = 1
    syncQuery()
  }

  function syncQuery() {
    const query = {}
    if (filters.search) query.search = filters.search
    if (filters.sort && filters.sort !== 'latest') query.sort = filters.sort
    if (filters.page > 1) query.page = String(filters.page)
    router.push({ query })
  }

  function initFromQuery(query) {
    filters.search = query.search || ''
    filters.sort = query.sort || 'latest'
    filters.page = parseInt(query.page) || 1
  }

  return {
    loading,
    jobs,
    pagination,
    filters,
    error,
    fetchJobs,
    setPage,
    updateFilter,
    initFromQuery,
    syncQuery,
  }
}
