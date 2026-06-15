import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as articleService from '@/services/public/articleService'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'

export function usePublicArticles() {
  const route = useRoute()
  const router = useRouter()

  const loading = ref(true)
  const heroLoading = ref(true)
  const articlesLoading = ref(true)
  const sidebarLoading = ref(true)

  const featuredArticles = ref([])
  const articles = ref([])
  const popularArticles = ref([])
  const categories = ref([])
  const tags = ref([])
  const error = ref(null)

  const pagination = ref({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })

  const filters = reactive({
    search: '',
    category: '',
    tag: '',
    sort: 'latest',
    page: 1,
  })

  async function fetchFeatured() {
    try {
      const { data } = await articleService.getFeaturedArticles(5)
      featuredArticles.value = data?.data || data || []
    } catch {
      featuredArticles.value = []
    } finally {
      heroLoading.value = false
    }
  }

  async function fetchArticles() {
    articlesLoading.value = true
    try {
      const params = { per_page: 9 }
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.tag) params.tag = filters.tag
      if (filters.sort && filters.sort !== 'latest') params.sort = filters.sort
      if (filters.page > 1) params.page = filters.page

      const { data } = await articleService.getArticles(params)
      articles.value = data?.data || []
      pagination.value = data?.meta || { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 }
      error.value = null
    } catch (err) {
      articles.value = []
      error.value = err.response?.data?.message || 'Failed to load articles'
    } finally {
      articlesLoading.value = false
    }
  }

  async function fetchSidebarData() {
    try {
      const [popularRes, catsRes, tagsRes] = await Promise.all([
        articleService.getPopularArticles(5),
        articleService.getCategoriesPublic(),
        articleService.getTagsPublic(),
      ])
      popularArticles.value = popularRes?.data?.data || popularRes?.data || []
      categories.value = catsRes?.data?.data || catsRes?.data || []
      tags.value = tagsRes?.data?.data || tagsRes?.data || []
    } catch {
      // silent
    } finally {
      sidebarLoading.value = false
    }
  }

  let isFirstLoad = true

  async function fetchAll() {
    if (isFirstLoad) loading.value = true
    try {
      await Promise.all([
        isFirstLoad ? fetchFeatured() : Promise.resolve(),
        fetchArticles(),
        isFirstLoad ? fetchSidebarData() : Promise.resolve(),
      ])
    } finally {
      loading.value = false
      isFirstLoad = false
    }
  }

  function setPage(page) {
    if (page < 1 || page > pagination.value.last_page) return
    filters.page = page
    syncQuery()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function selectTag(slug) {
    filters.tag = slug
    filters.category = ''
    filters.page = 1
    syncQuery()
  }

  function selectCategory(slug) {
    filters.category = slug
    filters.tag = ''
    filters.page = 1
    syncQuery()
  }

  function updateFilter(key, value) {
    filters[key] = value
    if (key !== 'page') filters.page = 1
    syncQuery()
  }

  function syncQuery() {
    const query = {}
    if (filters.search) query.search = filters.search
    if (filters.category) query.category = filters.category
    if (filters.tag) query.tag = filters.tag
    if (filters.sort && filters.sort !== 'latest') query.sort = filters.sort
    if (filters.page > 1) query.page = String(filters.page)
    router.push({ query })
  }

  function initFromQuery(query) {
    filters.search = query.search || ''
    filters.category = query.category || ''
    filters.tag = query.tag || ''
    filters.sort = query.sort || 'latest'
    filters.page = parseInt(query.page) || 1
  }

  useRefetchOnLanguageChange(fetchAll)

  return {
    loading,
    heroLoading,
    articlesLoading,
    sidebarLoading,
    featuredArticles,
    articles,
    popularArticles,
    categories,
    tags,
    pagination,
    filters,
    error,
    fetchAll,
    setPage,
    selectTag,
    selectCategory,
    updateFilter,
    initFromQuery,
    syncQuery,
  }
}
