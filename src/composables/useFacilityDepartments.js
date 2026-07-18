import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import {
  getFacilityDepartments,
  getFacilityDepartment,
  createFacilityDepartment,
  updateFacilityDepartment,
  deleteFacilityDepartment,
} from '@/services/departmentService'

export function useFacilityDepartments(facilityId) {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const departments = ref([])
  const pagination = ref({})
  const currentDepartment = ref(null)

  let _lastParams = {}

  async function fetchDepartments(params = {}) {
    if (!facilityId?.value) return
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await getFacilityDepartments(facilityId.value, params)
      departments.value = data.data
      pagination.value = {
        current_page: data.meta?.current_page,
        last_page: data.meta?.last_page,
        per_page: data.meta?.per_page,
        total: data.meta?.total,
        from: data.meta?.from,
        to: data.meta?.to,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load departments'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchDepartments(_lastParams))

  async function fetchDepartment(departmentId) {
    if (!facilityId?.value) return null
    try {
      const { data } = await getFacilityDepartment(facilityId.value, departmentId)
      currentDepartment.value = data.data
      return data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load department'
      store.addToast(msg, 'error')
      return null
    }
  }

  async function createDepartment(formData) {
    if (!facilityId?.value) return { success: false }
    saving.value = true
    try {
      await createFacilityDepartment(facilityId.value, formData)
      store.addToast(t('departments.created') || 'Department created successfully', 'success')
      await fetchDepartments(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create department'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateDepartment(departmentId, formData) {
    if (!facilityId?.value) return { success: false }
    saving.value = true
    try {
      await updateFacilityDepartment(facilityId.value, departmentId, formData)
      store.addToast(t('departments.updated') || 'Department updated successfully', 'success')
      await fetchDepartments(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update department'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteDepartment(departmentId) {
    if (!facilityId?.value) return { success: false }
    try {
      await deleteFacilityDepartment(facilityId.value, departmentId)
      store.addToast(t('departments.deleted') || 'Department deleted successfully', 'success')
      if (departments.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchDepartments(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete department'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    }
  }

  return {
    departments,
    loading,
    error,
    saving,
    pagination,
    currentDepartment,
    fetchDepartments,
    fetchDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  }
}
