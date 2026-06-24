import { defineStore } from 'pinia'
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as doctorApi from '@/api/doctors'

export const useDoctorsStore = defineStore('doctors', () => {
  const route = useRoute()
  const router = useRouter()

  const doctors = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({ current_page: 1, last_page: 1, total: 0, per_page: 12 })

  const facilityTypes = [
    { value: 'hospital', labelKey: 'categories.hospital' },
    { value: 'clinic', labelKey: 'categories.clinic' },
    { value: 'pharmacy', labelKey: 'categories.pharmacy' },
  ]

  const filters = reactive({
    search: route.query.search || '',
    facility_type: route.query.facility_type || '',
    page: parseInt(route.query.page) || 1,
  })

  const hasActiveFilters = computed(() => !!(filters.search || filters.facility_type))
  const totalPages = computed(() => pagination.value.last_page)

  async function fetchDoctors() {
    loading.value = true
    error.value = null
    try {
      const params = { page: filters.page, per_page: pagination.value.per_page }
      if (filters.search) params.search = filters.search
      if (filters.facility_type) params.facility_type = filters.facility_type

      const { data } = await doctorApi.getDoctors(params)
      const authStore = useAuthStore()
      const currentUser = authStore.user
      const allDoctors = data?.data || []
      doctors.value = currentUser
        ? allDoctors.filter(d => d.uuid !== currentUser.uuid)
        : allDoctors
      const meta = data?.meta
      if (meta) {
        pagination.value = {
          current_page: meta.current_page || 1,
          last_page: meta.last_page || 1,
          total: meta.total || 0,
          per_page: meta.per_page || 12,
        }
      } else if (data?.total !== undefined) {
        pagination.value = { ...pagination.value, total: data.total }
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load doctors'
      doctors.value = []
    } finally {
      loading.value = false
    }
  }

  function syncQuery() {
    const query = {}
    if (filters.search) query.search = filters.search
    if (filters.facility_type) query.facility_type = filters.facility_type
    if (filters.page > 1) query.page = filters.page
    router.push({ query, replace: true })
  }

  function setSearch(val) {
    filters.search = val
    filters.page = 1
    syncQuery()
  }

  function setFacilityType(val) {
    filters.facility_type = filters.facility_type === val ? '' : val
    filters.page = 1
    syncQuery()
  }

  function setPage(page) {
    filters.page = page
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
      fetchDoctors()
    },
    { deep: true }
  )

  initFromQuery(route.query)
  fetchDoctors()

  return {
    doctors, loading, error, pagination, filters, facilityTypes,
    hasActiveFilters, totalPages,
    fetchDoctors, setSearch, setFacilityType, setPage, clearFilters,
  }
})
