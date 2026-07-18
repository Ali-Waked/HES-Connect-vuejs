import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { useStaffStore } from '@/stores/useStaffStore'
import * as scheduleService from '@/services/scheduleService'

export function useStaffUnavailability() {
  const auth = useAuthStore()
  const workspaceStore = useWorkspaceStore()
  const store = useStaffStore()
  const facilityUuid = computed(() => workspaceStore.currentFacility?.uuid)
  const unavailabilityList = ref([])
  const loading = ref(false)
  const saving = ref(false)

  async function fetchUnavailability(params = {}) {
    if (!facilityUuid.value) return
    loading.value = true
    try {
      const { data } = await scheduleService.getUnavailability(facilityUuid.value, params)
      unavailabilityList.value = data.data || data || []
    } catch {
      unavailabilityList.value = []
    } finally {
      loading.value = false
    }
  }

  async function createUnavailability(formData) {
    if (!facilityUuid.value) return { success: false }
    saving.value = true
    try {
      await scheduleService.createUnavailability(facilityUuid.value, formData)
      store.showToast('Unavailability blocked successfully', 'success')
      await fetchUnavailability()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to block time'
      store.showToast(msg, 'error')
      return { success: false }
    } finally {
      saving.value = false
    }
  }

  async function deleteUnavailability(id) {
    if (!facilityUuid.value) return { success: false }
    try {
      await scheduleService.deleteUnavailability(facilityUuid.value, id)
      store.showToast('Unavailability removed', 'success')
      await fetchUnavailability()
      return { success: true }
    } catch {
      store.showToast('Failed to remove', 'error')
      return { success: false }
    }
  }

  return {
    unavailabilityList, loading, saving,
    fetchUnavailability, createUnavailability, deleteUnavailability
  }
}
