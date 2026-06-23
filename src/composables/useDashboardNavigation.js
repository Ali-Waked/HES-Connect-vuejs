import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useDashboardNavigation() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  const dashboardRoute = computed(() => authStore.dashboardRoute)

  function goToDashboard() {
    if (dashboardRoute.value) {
      router.push(dashboardRoute.value)
    }
  }

  const isDashboardPage = computed(() => {
    if (!dashboardRoute.value) return false
    const userBase = '/' + dashboardRoute.value.split('/').filter(Boolean)[0]
    const currentBase = '/' + route.path.split('/').filter(Boolean)[0]
    return userBase === currentBase
  })

  return {
    dashboardRoute,
    goToDashboard,
    isDashboardPage,
  }
}
