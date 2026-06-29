import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as notificationService from '@/services/notificationService'

export const useNotificationsStore = defineStore('notifications', () => {
  const { t } = useI18n()

  // ── State ──────────────────────────────────────────────────────────────────
  const items = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const loadingMore = ref(false)
  const saving = ref(false)
  const pagination = ref({ page: 1, lastPage: 1, total: 0, perPage: 20 })
  const filterType = ref(null)
  const filterRead = ref(null)

  // ── Real-time buffer ───────────────────────────────────────────────────────
  const buffer = ref([])
  let bufferTimer = null
  const BUFFER_FLUSH_MS = 500
  let echoChannel = null

  // ── Toast trigger for real-time notifications ──────────────────────────────
  const lastRealtime = ref(null)

  // ── Sound preference (localStorage-backed) ─────────────────────────────────
  const soundEnabled = ref(true)
  try {
    const stored = localStorage.getItem('hes_notification_sound')
    if (stored !== null) soundEnabled.value = stored === 'true'
  } catch {}

  function persistSound(val) {
    soundEnabled.value = val
    try { localStorage.setItem('hes_notification_sound', String(val)) } catch {}
  }

  function playNotificationSound() {
    if (!soundEnabled.value) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.08)
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.16)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }

  // ── Getters ────────────────────────────────────────────────────────────────
  const hasUnread = computed(() => unreadCount.value > 0)
  const last5 = computed(() => items.value.slice(0, 5))
  const unreadOnly = computed(() => items.value.filter(n => !n.read_at))

  // ── Icon config per notification type ──────────────────────────────────────
  const typeConfig = {
    story:        { bg: 'bg-blue-100 dark:bg-blue-900/30',    icon: 'text-blue-600 dark:text-blue-400',   svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>` },
    fundraising:  { bg: 'bg-rose-100 dark:bg-rose-900/30',    icon: 'text-rose-600 dark:text-rose-400',   svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>` },
    user:         { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400', svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>` },
    org:          { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400', svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>` },
    facility:     { bg: 'bg-teal-100 dark:bg-teal-900/30',    icon: 'text-teal-600 dark:text-teal-400',   svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"/>` },
    system:       { bg: 'bg-slate-100 dark:bg-slate-800',     icon: 'text-slate-500 dark:text-slate-400',  svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>` },
    appointment:  { bg: 'bg-amber-100 dark:bg-amber-900/30',  icon: 'text-amber-600 dark:text-amber-400',  svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>` },
    prescription: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400', svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>` },
    review:       { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400', svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>` },
    article:      { bg: 'bg-cyan-100 dark:bg-cyan-900/30',    icon: 'text-cyan-600 dark:text-cyan-400',   svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"/>` },
  }

  function getConfig(type) {
    return typeConfig[type] || typeConfig.system
  }

  // ── Normalize a backend notification into our format ───────────────────────
  function normalize(raw) {
    const data = raw.data || {}
    return {
      id: raw.id,
      uuid: raw.uuid || raw.id,
      type: raw.type_name || data.type || 'system',
      title: data.title || raw.title || '',
      message: data.message || raw.message || '',
      action_url: data.action_url || raw.action_url || null,
      read_at: raw.read_at || null,
      created_at: raw.created_at || raw.createdAt,
      updated_at: raw.updated_at || raw.updatedAt,
      raw_type: raw.type,
    }
  }

  // ── API Actions ────────────────────────────────────────────────────────────
  async function fetchNotifications(params = {}) {
    loading.value = true
    try {
      const query = {
        page: params.page || 1,
        per_page: params.perPage || pagination.value.perPage,
        ...(filterType.value ? { type: filterType.value } : {}),
        ...(filterRead.value !== null ? { read: filterRead.value } : {}),
        ...params,
      }
      const { data } = await notificationService.getNotifications(query)
      const list = (data.data || data.notifications || data || []).map(normalize)
      const meta = data.meta || data.pagination || {}
      pagination.value = {
        page: meta.current_page || meta.page || query.page,
        lastPage: meta.last_page || meta.lastPage || 1,
        total: meta.total || list.length,
        perPage: meta.per_page || meta.perPage || query.per_page,
      }
      if (query.page === 1) {
        items.value = list
      } else {
        const existingIds = new Set(items.value.map(n => n.id))
        const deduped = list.filter(n => !existingIds.has(n.id))
        items.value.push(...deduped)
      }
      if (typeof data.unread_count === 'number') {
        unreadCount.value = data.unread_count
      } else {
        updateUnreadCount()
      }
    } catch {
      if (pagination.value.page === 1) items.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchMore() {
    if (loadingMore.value || pagination.value.page >= pagination.value.lastPage) return
    loadingMore.value = true
    await fetchNotifications({ page: pagination.value.page + 1 })
    loadingMore.value = false
  }

  async function markAsRead(uuid) {
    const item = items.value.find(n => n.uuid === uuid)
    if (item && item.read_at) return
    optimisticMarkRead(uuid)
    try {
      await notificationService.markAsRead(uuid)
    } catch {
      optimisticUnmarkRead(uuid)
    }
  }

  async function markAllAsRead() {
    const prevUnread = unreadCount.value
    optimisticMarkAllRead()
    try {
      await notificationService.markAllAsRead()
    } catch {
      unreadCount.value = prevUnread
      items.value.forEach(n => { n.read_at = null })
    }
  }

  async function deleteNotification(uuid) {
    const idx = items.value.findIndex(n => n.uuid === uuid || n.id === uuid)
    if (idx === -1) return
    const removed = items.value.splice(idx, 1)[0]
    if (!removed.read_at) unreadCount.value = Math.max(0, unreadCount.value - 1)
    try {
      await notificationService.deleteNotification(uuid)
    } catch {
      items.value.splice(idx, 0, removed)
      if (!removed.read_at) unreadCount.value++
    }
  }

  async function refreshUnreadCount() {
    try {
      const { data } = await notificationService.getUnreadCount()
      unreadCount.value = typeof data === 'number' ? data : (data.count || data.unread_count || 0)
    } catch {}
  }

  // ── Optimistic updates ─────────────────────────────────────────────────────
  function optimisticMarkRead(uuid) {
    const item = items.value.find(n => n.uuid === uuid)
    if (item) {
      item.read_at = new Date().toISOString()
      updateUnreadCount()
    }
  }

  function optimisticUnmarkRead(uuid) {
    const item = items.value.find(n => n.uuid === uuid)
    if (item) {
      item.read_at = null
      updateUnreadCount()
    }
  }

  function optimisticMarkAllRead() {
    items.value.forEach(n => { n.read_at = new Date().toISOString() })
    unreadCount.value = 0
  }

  function updateUnreadCount() {
    unreadCount.value = items.value.filter(n => !n.read_at).length
  }

  function setFilterType(type) {
    filterType.value = type
    fetchNotifications({ page: 1 })
  }

  function setFilterRead(read) {
    filterRead.value = read
    fetchNotifications({ page: 1 })
  }

  // ── WebSocket / Echo Integration ───────────────────────────────────────────
  function subscribeToChannel(userId) {
    if (!userId || !import.meta.env.VITE_PUSHER_APP_KEY) return
    import('@/services/echo').then(({ echo }) => {
      if (echoChannel) leaveChannel()
      echoChannel = echo.private(`user.${userId}`)

      echoChannel.listen('.NotificationCreated', (event) => {
        pushToBuffer({ type: 'created', notification: event.notification || event })
      })

      echoChannel.listen('.NotificationRead', (event) => {
        const uuid = event.uuid || event.id
        if (uuid) optimisticMarkRead(uuid)
      })

      echoChannel.listen('.NotificationCountUpdated', (event) => {
        if (typeof event.count === 'number') {
          unreadCount.value = event.count
        } else if (typeof event.unread_count === 'number') {
          unreadCount.value = event.unread_count
        }
      })
    }).catch(() => {})
  }

  function leaveChannel() {
    if (!echoChannel) return
    import('@/services/echo').then(({ echo }) => {
      try {
        echo.leave(echoChannel.name)
      } catch {}
      echoChannel = null
    }).catch(() => {})
  }

  // ── Buffer / Debounce ──────────────────────────────────────────────────────
  function pushToBuffer(event) {
    buffer.value.push(event)
    if (bufferTimer) clearTimeout(bufferTimer)
    bufferTimer = setTimeout(() => flushBuffer(), BUFFER_FLUSH_MS)
  }

  function flushBuffer() {
    if (buffer.value.length === 0) return
    const events = buffer.value.splice(0)
    bufferTimer = null

    for (const evt of events) {
      if (evt.type === 'created') {
        const n = normalize(evt.notification || evt)
        items.value.unshift(n)
        unreadCount.value++
        lastRealtime.value = n
        playNotificationSound()
        lastRealtime.value = null
      }
    }
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────
  function cleanup() {
    if (bufferTimer) {
      clearTimeout(bufferTimer)
      bufferTimer = null
    }
    buffer.value = []
    leaveChannel()
  }

  return {
    items,
    unreadCount,
    loading,
    loadingMore,
    saving,
    pagination,
    filterType,
    filterRead,
    hasUnread,
    last5,
    unreadOnly,
    lastRealtime,
    soundEnabled,
    typeConfig,
    getConfig,
    persistSound,
    fetchNotifications,
    fetchMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
    setFilterType,
    setFilterRead,
    subscribeToChannel,
    leaveChannel,
    cleanup,
    pushToBuffer,
    flushBuffer,
  }
})
