import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import * as facilityService from '@/services/public/facilityService'

export function usePublicFacilities() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const facilities = ref([])
  const loading = ref(true)
  const error = ref(null)
  const pagination = ref({ current_page: 1, last_page: 1, total: 0 })

  const filters = reactive({
    search: route.query.search || '',
    facility_type: route.query.facility_type || '',
    page: parseInt(route.query.page) || 1,
  })

  const hasActiveFilters = computed(() => !!(filters.search || filters.facility_type))

  const facilityTypes = [
    { value: 'hospital', label: t('categories.hospital') },
    { value: 'clinic', label: t('categories.clinic') },
    { value: 'pharmacy', label: t('categories.pharmacy') },
    { value: 'medical_point', label: t('categories.medicalPoint') },
  ]

  const skeletonItems = Array.from({ length: 6 }, (_, i) => i)

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      const params = { per_page: 6 }
      if (filters.search) params.search = filters.search
      if (filters.facility_type) params.facility_type = filters.facility_type
      if (filters.page > 1) params.page = filters.page

      const { data } = await facilityService.getFacilities(params)
      facilities.value = data?.data || []
      pagination.value = data?.meta || { current_page: 1, last_page: 1, total: 0 }
    } catch (err) {
      facilities.value = []
      error.value = err.response?.data?.message || 'Failed to load facilities'
    } finally {
      loading.value = false
    }
  }

  function syncQuery() {
    const query = {}
    if (filters.search) query.search = filters.search
    if (filters.facility_type) query.facility_type = filters.facility_type
    if (filters.page > 1) query.page = String(filters.page)
    router.push({ query })
  }

  function handleSearch() {
    filters.page = 1
    syncQuery()
  }

  function setType(val) {
    filters.facility_type = filters.facility_type === val ? '' : val
    filters.page = 1
    syncQuery()
  }

  function handlePageChange(p) {
    if (p < 1 || p > pagination.value.last_page) return
    filters.page = p
    syncQuery()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearFilters() {
    filters.search = ''
    filters.facility_type = ''
    filters.page = 1
    syncQuery()
  }

  function initFromQuery(query) {
    filters.search = query.search || ''
    filters.facility_type = query.facility_type || ''
    filters.page = parseInt(query.page) || 1
  }

  watch(
    () => route.query,
    (query) => {
      initFromQuery(query)
      fetchList()
    },
    { deep: true }
  )

  onMounted(fetchList)

  return {
    facilities,
    loading,
    error,
    pagination,
    filters,
    hasActiveFilters,
    facilityTypes,
    skeletonItems,
    fetchList,
    handleSearch,
    setType,
    handlePageChange,
    clearFilters,
    initFromQuery,
    syncQuery,
  }
}
