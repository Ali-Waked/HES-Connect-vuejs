import { ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as articleService from '@/services/public/articleService'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'

export function usePublicArticles() {
  const route = useRoute()
  const router = useRouter()

  const loading = ref(true)
  const articlesLoading = ref(true)
  const sidebarLoading = ref(true)

  const articles = ref([])
  const mostRead = ref([])
  const popularTopics = ref([])
  const categories = ref([])
  const error = ref(null)

  const pagination = ref({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })

  const filters = reactive({
    search: '',
    category: '',
    sort_by: 'latest',
    page: 1,
  })

  async function fetchArticles() {
    articlesLoading.value = true
    try {
      const params = { per_page: 9 }
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.sort_by && filters.sort_by !== 'latest') params.sort_by = filters.sort_by
      if (filters.page > 1) params.page = filters.page

      const { data } = await articleService.getArticles(params)
      articles.value = data?.data || []
      pagination.value = data?.meta || { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 }
      mostRead.value = data?.most_read || []
      popularTopics.value = data?.popular_topics || []
      categories.value = data?.categories || []
      error.value = null
    } catch (err) {
      articles.value = []
      error.value = err.response?.data?.message || 'Failed to load articles'
    } finally {
      articlesLoading.value = false
    }
  }

  let isFirstLoad = true

  async function fetchAll() {
    if (isFirstLoad) loading.value = true
    try {
      await fetchArticles()
      sidebarLoading.value = false
    } finally {
      loading.value = false
      isFirstLoad = false
    }
  }

  function setPage(page) {
    if (page < 1 || page > pagination.value.last_page) return
    filters.page = page
    syncQuery()
    fetchArticles()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function selectCategory(uuid) {
    filters.category = filters.category === uuid ? '' : uuid
    filters.page = 1
    syncQuery()
    fetchArticles()
  }

  function updateFilter(key, value) {
    filters[key] = value
    if (key !== 'page') filters.page = 1
    syncQuery()
    fetchArticles()
  }

  function syncQuery() {
    const query = {}
    if (filters.search) query.search = filters.search
    if (filters.category) query.category = filters.category
    if (filters.sort_by && filters.sort_by !== 'latest') query.sort_by = filters.sort_by
    if (filters.page > 1) query.page = String(filters.page)
    router.push({ query })
  }

  function initFromQuery(query) {
    filters.search = query.search || ''
    filters.category = query.category || ''
    filters.sort_by = query.sort_by || 'latest'
    filters.page = parseInt(query.page) || 1
  }

  useRefetchOnLanguageChange(fetchAll)

  return {
    loading,
    articlesLoading,
    sidebarLoading,
    articles,
    mostRead,
    popularTopics,
    categories,
    pagination,
    filters,
    error,
    fetchAll,
    setPage,
    selectCategory,
    updateFilter,
    initFromQuery,
  }
}
