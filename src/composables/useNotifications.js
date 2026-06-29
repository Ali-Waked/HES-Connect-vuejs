import { onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import { useRefetchOnLanguageChange } from './useRefetchOnLanguageChange'

export function useNotifications(options = {}) {
  const { autoFetch = true, subscribeRealtime = true } = options
  const store = useNotificationsStore()
  const auth = useAuthStore()

  function init() {
    if (autoFetch) {
      store.fetchNotifications()
    }
    if (subscribeRealtime) {
      const userId = auth.user?.uuid || auth.user?.id
      if (userId) {
        store.subscribeToChannel(userId)
      }
    }
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    store.cleanup()
  })

  useRefetchOnLanguageChange(() => {
    store.fetchNotifications()
  })

  return {
    store,
  }
}
