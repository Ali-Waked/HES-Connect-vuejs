import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useDataTable(options = {}) {
  const {
    fetchFn = null,
    defaultSort = 'created_at',
    defaultOrder = 'desc',
    perPage = 15,
    syncUrl = true,
  } = options

  const route = useRoute()
  const router = useRouter()

  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage,
  })

  const search = ref('')
  const sortField = ref(defaultSort)
  const sortOrder = ref(defaultOrder)
  const filters = ref({})

  const queryParams = computed(() => {
    const params = {
      page: pagination.value.currentPage,
      per_page: pagination.value.perPage,
      sort: sortOrder.value === 'desc' ? `-${sortField.value}` : sortField.value,
    }
    if (search.value) params.search = search.value
    return { ...params, ...filters.value }
  })

  async function load(page) {
    if (!fetchFn) return
    loading.value = true
    error.value = null
    if (page) pagination.value.currentPage = page
    try {
      const res = await fetchFn(queryParams.value)
      const data = res.data?.data || res.data
      const meta = res.data?.meta || res.data?.pagination || {}
      items.value = Array.isArray(data) ? data : []
      pagination.value = {
        currentPage: meta.current_page || meta.currentPage || 1,
        lastPage: meta.last_page || meta.lastPage || 1,
        total: meta.total || 0,
        perPage: meta.per_page || meta.perPage || perPage,
      }
      if (syncUrl) {
        router.replace({ query: { ...route.query, page: pagination.value.currentPage, search: search.value || undefined } }).catch(() => {})
      }
    } catch (err) {
      error.value = err.message || 'Failed to load data.'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  function sort(field) {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortOrder.value = 'desc'
    }
    load(1)
  }

  function applyFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    load(1)
  }

  function resetFilters() {
    filters.value = {}
    search.value = ''
    load(1)
  }

  const totalItems = computed(() => pagination.value.total)
  const lastPage = computed(() => pagination.value.lastPage)

  return {
    items,
    loading,
    error,
    pagination,
    search,
    sortField,
    sortOrder,
    queryParams,
    load,
    sort,
    applyFilters,
    resetFilters,
    totalItems,
    lastPage,
  }
}
