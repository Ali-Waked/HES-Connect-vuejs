import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useDashboardNavigation() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  const dashboardRoute = computed(() => authStore.dashboardRoute)

  function goToDashboard() {
    const dest = dashboardRoute.value
    if (dest) router.push(dest)
  }

  const isDashboardPage = computed(() => {
    const dest = dashboardRoute.value
    if (!dest) return false
    const userBase = '/' + dest.split('/').filter(Boolean)[0]
    const currentBase = '/' + route.path.split('/').filter(Boolean)[0]
    return userBase === currentBase
  })

  return {
    dashboardRoute,
    goToDashboard,
    isDashboardPage,
  }
}
