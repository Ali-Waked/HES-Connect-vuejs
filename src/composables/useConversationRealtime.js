import { ref, watch, onUnmounted } from 'vue'
import { echo as echoInstance } from '@/services/echo'
import { useAuthStore } from '@/stores/auth'

export function useConversationRealtime(options = {}) {
  const {
    conversationId = null,
    onMessageReceived = null,
    onConversationListUpdated = null,
    enableUserChannel = false,
    messageEvent = 'MessageSent',
    listEvent = 'NewConversationMessage',
  } = options

  const isConnected = ref(false)
  const error = ref(null)

  let conversationChannel = null
  let userChannel = null
  let cleanupFns = []

  if (!import.meta.env.VITE_PUSHER_APP_KEY) {
    error.value = 'Pusher app key not configured'
  }

  function on(el, event, handler) {
    el.bind(event, handler)
    cleanupFns.push(() => el.unbind(event, handler))
  }

  function subscribeConversation(id) {
    if (!id) return

    if (conversationChannel) {
      const prevId = conversationChannel._conversationId
      echoInstance.leave(`private-conversation.${prevId}`)
      conversationChannel = null
    }

    const channel = echoInstance.channel(`private-conversation.${id}`)
    channel._conversationId = id
    conversationChannel = channel

    on(channel, messageEvent, (event) => {
      if (onMessageReceived) {
        onMessageReceived(event.message || event, id)
      }
    })
  }

  function subscribeUserChannel() {
    if (userChannel) {
      const prevId = userChannel._userId
      echoInstance.leave(`private-user.${prevId}`)
      userChannel = null
    }

    const auth = useAuthStore()
    const userId = auth.user?.uuid
    if (!userId) return

    const channel = echoInstance.channel(`private-user.${userId}`)
    channel._userId = userId
    userChannel = channel

    on(channel, listEvent, (event) => {
      if (onConversationListUpdated) {
        onConversationListUpdated(event.conversation || event)
      }
    })
  }

  function bindConnectionEvents() {
    const pusher = echoInstance?.connector?.pusher
    if (!pusher) return

    const handleConnected = () => {
      isConnected.value = true
      error.value = null
    }

    const handleReconnected = () => {
      isConnected.value = true
      error.value = null
      if (conversationChannel?._conversationId) {
        subscribeConversation(conversationChannel._conversationId)
      }
      if (enableUserChannel) {
        subscribeUserChannel()
      }
    }

    const handleError = (err) => {
      error.value = err.error?.message || 'Connection error'
    }

    pusher.connection.bind('connected', handleConnected)
    pusher.connection.bind('reconnected', handleReconnected)
    pusher.connection.bind('error', handleError)

    cleanupFns.push(() => pusher.connection.unbind('connected', handleConnected))
    cleanupFns.push(() => pusher.connection.unbind('reconnected', handleReconnected))
    cleanupFns.push(() => pusher.connection.unbind('error', handleError))

    if (pusher.connection.state === 'connected') {
      isConnected.value = true
    }
  }

  function init() {
    if (!import.meta.env.VITE_PUSHER_APP_KEY) return

    try {
      bindConnectionEvents()

      if (conversationId?.value) {
        subscribeConversation(conversationId.value)
      }

      if (enableUserChannel) {
        subscribeUserChannel()
      }
    } catch (err) {
      error.value = err.message || 'Failed to initialize Echo'
    }
  }

  if (conversationId) {
    watch(conversationId, (newId) => {
      subscribeConversation(newId)
    })
  }

  onUnmounted(() => {
    const id = conversationChannel?._conversationId
    if (id) {
      echoInstance.leave(`private-conversation.${id}`)
    }
    conversationChannel = null

    const uid = userChannel?._userId
    if (uid) {
      echoInstance.leave(`private-user.${uid}`)
    }
    userChannel = null

    cleanupFns.forEach((fn) => fn())
    cleanupFns = []
  })

  init()

  return {
    isConnected,
    error,
  }
}
