import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getPublicStaffByUuid } from '@/services/staffService'

export const useStaffDetailStore = defineStore('staffDetail', () => {
  const staff = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchStaff(uuid) {
    loading.value = true
    error.value = null
    try {
      const { data } = await getPublicStaffByUuid(uuid)
      staff.value = data.data || data
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load staff details'
      error.value = msg
    } finally {
      loading.value = false
    }
  }

  function $reset() {
    staff.value = null
    loading.value = false
    error.value = null
  }

  return { staff, loading, error, fetchStaff, $reset }
})
