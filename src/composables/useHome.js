import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getHomeData } from '../api/home'

const CACHE_TTL = 5 * 60 * 1000

const CACHE_KEY = 'home_data'

function getCached(key) {
  try {
    const raw = localStorage.getItem(`hes_cache_${key}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(`hes_cache_${key}`)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCached(key, data) {
  try {
    localStorage.setItem(`hes_cache_${key}`, JSON.stringify({ data, ts: Date.now() }))
  } catch {
  }
}

const globalState = ref(null)
const globalLoading = ref(false)
const globalError = ref(null)

let activeFetchId = 0

export function useHome() {
  const localLoading = ref(false)
  const localError = ref(null)

  const data = computed(() => globalState.value)
  const loading = computed(() => globalLoading.value || localLoading.value)
  const error = computed(() => globalError.value || localError.value)

  const statistics = computed(() => data.value?.statistics ?? null)
  const featuredFacilities = computed(() => data.value?.featured_facilities ?? [])
  const facilityCategories = computed(() => data.value?.facility_categories ?? [])
  const latestArticles = computed(() => data.value?.latest_articles ?? [])
  const latestStories = computed(() => data.value?.latest_stories ?? [])
  const latestJobs = computed(() => data.value?.latest_jobs ?? [])
  const aboutPreview = computed(() => data.value?.about_preview ?? null)
  const platformReviews = computed(() => data.value?.platform_reviews ?? [])

  const hasData = computed(() => !!data.value)
  const isEmpty = computed(() => !loading.value && !error.value && !hasData.value)

  function skeletonItems(n) {
    return Array.from({ length: n }, (_, i) => i)
  }

  async function fetchData(force = false) {
    if (globalLoading.value) return

    if (!force) {
      const cached = getCached(CACHE_KEY)
      if (cached) {
        globalState.value = cached
        localLoading.value = false
        return
      }
    }

    const fetchId = ++activeFetchId
    globalLoading.value = true
    globalError.value = null
    localLoading.value = true
    localError.value = null

    try {
      const { data: raw } = await getHomeData()
      if (fetchId !== activeFetchId) return
      const payload = raw?.data || raw
      globalState.value = payload
      setCached(CACHE_KEY, payload)
    } catch (err) {
      if (fetchId !== activeFetchId) return
      const message = err.response?.data?.message || err.message || 'Failed to load homepage data'
      globalError.value = message
      localError.value = message
    } finally {
      if (fetchId === activeFetchId) {
        globalLoading.value = false
      }
      localLoading.value = false
    }
  }

  onMounted(() => {
    fetchData()
  })

  function refresh() {
    return fetchData(true)
  }

  return {
    data,
    loading,
    error,
    statistics,
    featuredFacilities,
    facilityCategories,
    latestArticles,
    latestStories,
    latestJobs,
    aboutPreview,
    platformReviews,
    hasData,
    isEmpty,
    skeletonItems,
    refresh,
    fetchData,
  }
}
