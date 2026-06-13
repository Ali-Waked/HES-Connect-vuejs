import { ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import * as userService from '@/services/userService'

export function useUserStats() {
  const store = useDashboardStore()

  const loading = ref(false)
  const error = ref(null)
  const stats = ref({ total_users: 0, total_staff: 0, total_patients: 0, online_now: 0 })

  async function fetchUserStats() {
    loading.value = true
    error.value = null
    try {
      const { data } = await userService.getUserStats()
      stats.value = data
      store.userStats = {
        total: data.total_users,
        staff: data.total_staff,
        patients: data.total_patients,
        online: data.online_now,
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load user stats'
      error.value = msg
      store.addToast(msg, 'error')
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    fetchUserStats,
  }
}
