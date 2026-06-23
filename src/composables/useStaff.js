import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'
import * as staffService from '@/services/staffService'

export function useStaff() {
  const store = useDashboardStore()
  const { t } = useI18n()

  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)
  const checkingEmail = ref(false)
  const staff = ref([])
  const pagination = ref({})

  let _lastParams = {}

  async function fetchStaff(params = {}) {
    loading.value = true
    error.value = null
    _lastParams = params
    try {
      const { data } = await staffService.getStaff(params)
      staff.value = data.data
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
      const msg = err.response?.data?.message || 'Failed to load staff'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  useRefetchOnLanguageChange(() => fetchStaff(_lastParams))

  async function fetchStaffById(id) {
    const { data } = await staffService.getStaffById(id)
    return data.data || data
  }

  async function checkStaffEmail(email) {
    checkingEmail.value = true
    try {
      const { data } = await staffService.checkStaffEmail(email)
      return { exists: data.exists, has_staff_profile: data.has_staff_profile, user: data.user || null, staff: data.staff || null }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to check email'
      store.addToast(msg, 'error')
      return { exists: false, has_staff_profile: false, user: null, staff: null, error: msg }
    } finally {
      checkingEmail.value = false
    }
  }

  async function createStaff(formData) {
    saving.value = true
    try {
      await staffService.createStaff(formData)
      store.addToast('Staff member created successfully', 'success')
      await fetchStaff(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create staff member'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function updateStaff(id, formData) {
    saving.value = true
    try {
      await staffService.updateStaff(id, formData)
      store.addToast('Staff member updated successfully', 'success')
      await fetchStaff(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update staff member'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  async function terminateFacilityStaff(facilityStaffUuid) {
    saving.value = true
    try {
      await staffService.terminateFacilityStaff(facilityStaffUuid)
      store.addToast('Facility assignment terminated successfully', 'success')
      await fetchStaff(_lastParams)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to terminate facility assignment'
      store.addToast(msg, 'error')
      return { success: false, error: msg }
    } finally {
      saving.value = false
    }
  }

  return {
    staff,
    loading,
    error,
    saving,
    checkingEmail,
    pagination,
    fetchStaff,
    fetchStaffById,
    checkStaffEmail,
    createStaff,
    updateStaff,
    terminateFacilityStaff,
  }
}
