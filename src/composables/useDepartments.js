import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as departmentService from '@/services/departmentService'

export function useDepartments() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const departments = ref([])
  const pagination = ref({})
  const stats = ref(null)
  const statsLoading = ref(false)

  let _lastParams = {}

  async function fetchDepartments(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await departmentService.getDepartments(params)
      departments.value = data.data
      console.log(data.data);
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

  async function fetchDepartmentStats() {
    statsLoading.value = true
    try {
      const { data } = await departmentService.getDepartmentStats()
      stats.value = data
    } catch (err) {
      // silently fail for stats
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchDepartment(uuid) {
    const { data } = await departmentService.getDepartment(uuid)
    return data
  }

  async function createDepartment(formData) {
    saving.value = true
    try {
      await departmentService.createDepartment(formData)
      store.addToast(t('departments.created') || 'Department created successfully', 'success')
      await fetchDepartments(_lastParams)
      await fetchDepartmentStats()
      return { success: true }
    } catch (err) {
      console.log(err, err.response?.data)
      const msg = err.response?.data?.message || 'Failed to create department'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateDepartment(uuid, formData) {
    saving.value = true
    try {
      await departmentService.updateDepartment(uuid, formData)
      store.addToast(t('departments.updated') || 'Department updated successfully', 'success')
      await fetchDepartments(_lastParams)
      await fetchDepartmentStats()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update department'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function deleteDepartment(uuid) {
    try {
      await departmentService.deleteDepartment(uuid)
      store.addToast('Department deleted successfully', 'success')
      if (departments.value.length <= 1 && (_lastParams.page || 1) > 1) {
        _lastParams = { ..._lastParams, page: (_lastParams.page || 1) - 1 }
      }
      await fetchDepartments(_lastParams)
      await fetchDepartmentStats()
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
    stats,
    statsLoading,
    fetchDepartments,
    fetchDepartmentStats,
    fetchDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  }
}
