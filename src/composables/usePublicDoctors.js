import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import * as doctorService from '@/services/public/doctorService'

export function usePublicDoctors() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const doctors = ref([])
  const loading = ref(true)
  const error = ref(null)
  const total = ref(0)

  const filters = reactive({
    search: route.query.search || '',
    specialization: route.query.specialization || '',
    facility_id: route.query.facility_id || '',
  })

  const hasActiveFilters = reactive({ value: false })
  function updateHasActive() {
    hasActiveFilters.value = !!(filters.search || filters.specialization || filters.facility_id)
  }

  const specializations = [
    'Emergency Medicine', 'Pediatrics', 'General Surgery',
    'Cardiology', 'Obstetrics & Gynecology', 'Orthopedics',
  ]

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
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.specialization) params.specialization = filters.specialization
      if (filters.facility_id) params.facility_id = filters.facility_id

      const { data } = await doctorService.getDoctors(params)
      doctors.value = data?.data || []
      total.value = data?.meta?.total || data?.total || 0
    } catch (err) {
      doctors.value = []
      error.value = err.response?.data?.message || 'Failed to load doctors'
    } finally {
      loading.value = false
    }
  }

  function syncQuery() {
    const query = {}
    if (filters.search) query.search = filters.search
    if (filters.specialization) query.specialization = filters.specialization
    if (filters.facility_id) query.facility_id = filters.facility_id
    router.push({ query })
  }

  function handleSearch() {
    syncQuery()
  }

  function setSpecialization(val) {
    filters.specialization = filters.specialization === val ? '' : val
    syncQuery()
  }

  function setFacilityType(val) {
    filters.facility_id = filters.facility_id === val ? '' : val
    syncQuery()
  }

  function clearFilters() {
    filters.search = ''
    filters.specialization = ''
    filters.facility_id = ''
    syncQuery()
  }

  function initFromQuery(query) {
    filters.search = query.search || ''
    filters.specialization = query.specialization || ''
    filters.facility_id = query.facility_id || ''
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
    doctors,
    loading,
    error,
    total,
    filters,
    hasActiveFilters,
    specializations,
    facilityTypes,
    skeletonItems,
    fetchList,
    handleSearch,
    setSpecialization,
    setFacilityType,
    clearFilters,
    initFromQuery,
    syncQuery,
  }
}
