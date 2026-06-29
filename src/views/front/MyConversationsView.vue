<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { resolveTranslatedValue } from '@/utils/locale'
import { getConversations, getConversation, sendMessage, markAsRead } from '@/services/chatService'
import { useConversationRealtime } from '@/composables/useConversationRealtime'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const props = defineProps({
  id: { type: [String, Number], default: null }
})

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const auth = useAuthStore()

const conversations = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const selectedConversation = ref(null)
const messages = ref([])
const loadingMessages = ref(false)
const newMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const mobileShowChat = ref(false)
const loadingOlder = ref(false)
const olderPage = ref(1)
const hasMoreOlder = ref(true)
const isInitialLoad = ref(true)

const myUuid = computed(() => auth.user?.uuid)

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) return conversations.value
  const q = searchQuery.value.toLowerCase()
  return conversations.value.filter(conv => {
    const other = getOtherParticipant(conv)
    const name = resolveTranslatedValue(other?.name, locale.value) || ''
    return name.toLowerCase().includes(q)
  })
})

function isSupportConversation(conv) {
  return (conv.participants?.length || 0) > 2
}

function getOtherParticipant(conv) {
  return conv.participants?.find(p => p.uuid !== myUuid.value) || conv.participants?.[0]
}

function getParticipantName(conv) {
  if (isSupportConversation(conv)) return 'Support'
  const other = getOtherParticipant(conv)
  return resolveTranslatedValue(other?.name, locale.value) || 'Unknown'
}

function getParticipantAvatar(conv) {
  if (isSupportConversation(conv)) return null
  const other = getOtherParticipant(conv)
  return other?.avatar || null
}

function getInitial(name) {
  if (!name || name === 'Unknown') return '?'
  return String(name).charAt(0).toUpperCase()
}

function isParticipantOnline(conv) {
  if (isSupportConversation(conv)) return true
  const other = getOtherParticipant(conv)
  return other?.is_online ?? false
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMessageTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false
  return new Date(d1).toDateString() === new Date(d2).toDateString()
}

function formatDateSeparator(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return 'Today'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

async function fetchConversations() {
  loading.value = true
  error.value = null
  try {
    const { data } = await getConversations()
    console.log(data);
    conversations.value = data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load conversations'
  } finally {
    loading.value = false
  }
}

async function selectConversation(conv) {
  selectedConversation.value = conv
  messages.value = []
  olderPage.value = 1
  hasMoreOlder.value = true
  isInitialLoad.value = true
  mobileShowChat.value = true
  await loadMessages(conv.id)
}

async function loadMessages(conversationId) {
  loadingMessages.value = true
  try {
    const { data } = await getConversation(conversationId)
    const rawMessages = data.messages?.data || data.messages || []
    messages.value = rawMessages
      .map(m => ({ ...m, is_me: m.sender?.uuid === myUuid.value }))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    hasMoreOlder.value = rawMessages.length >= 15
    if (hasMoreOlder.value) olderPage.value = 2

    if (isInitialLoad.value) {
      await scrollToBottom()
      isInitialLoad.value = false
    }

    if (selectedConversation.value) {
      selectedConversation.value.unread_messages_count = 0
      markAsRead(conversationId).catch(() => {})
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load messages'
  } finally {
    loadingMessages.value = false
  }
}

async function loadOlderMessages() {
  if (!selectedConversation.value || loadingOlder.value || !hasMoreOlder.value) return
  loadingOlder.value = true
  const el = messagesContainer.value
  const prevScrollHeight = el ? el.scrollHeight : 0
  try {
    const { data } = await getConversation(selectedConversation.value.id, { page: olderPage.value })
    const rawMessages = data.messages?.data || data.messages || []
    const older = rawMessages.map(m => ({ ...m, is_me: m.sender?.uuid === myUuid.value }))
    if (older.length === 0) {
      hasMoreOlder.value = false
    } else {
      messages.value = [...older, ...messages.value]
      olderPage.value++
      if (older.length < 15) hasMoreOlder.value = false
      await nextTick()
      if (el) el.scrollTop = el.scrollHeight - prevScrollHeight
    }
  } catch { hasMoreOlder.value = false } finally { loadingOlder.value = false }
}

function onScroll() {
  const el = messagesContainer.value
  if (!el || loadingOlder.value || !hasMoreOlder.value) return
  if (el.scrollTop < 50) loadOlderMessages()
}

async function scrollToBottom(smooth = false) {
  await nextTick()
  const el = messagesContainer.value
  if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
}

async function send() {
  const text = newMessage.value.trim()
  if (!text || sending.value || !selectedConversation.value) return
  sending.value = true
  try {
    const { data } = await sendMessage(selectedConversation.value.id, { message: text })
    const msg = data.data || data
    const msgId = msg.id || Date.now()
    seenMessageIds.value.add(msgId)
    messages.value.push({
      id: msgId, message: text, is_me: true,
      sender: { uuid: myUuid.value }, created_at: new Date().toISOString()
    })
    newMessage.value = ''
    await scrollToBottom(true)
    if (selectedConversation.value) {
      selectedConversation.value.last_message = { message: text, created_at: new Date().toISOString() }
      selectedConversation.value.last_message_at = new Date().toISOString()
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to send message'
  } finally { sending.value = false }
}

function goBack() {
  mobileShowChat.value = false
  selectedConversation.value = null
  messages.value = []
}

function autoResize(e) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

/* ── Real-time ── */

const seenMessageIds = ref(new Set())

const currentConversationId = computed(() => selectedConversation.value?.id || null)

function handleRealtimeMessage(event, conversationId) {
  if (!event || conversationId !== currentConversationId.value) return

  const messageId = event.id
  if (messageId && seenMessageIds.value.has(messageId)) return
  if (messageId) seenMessageIds.value.add(messageId)

  const msg = {
    ...event,
    is_me: event.sender?.uuid === myUuid.value,
  }

  messages.value = [...messages.value, msg].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  )

  nextTick(() => scrollToBottom(true))

  selectedConversation.value.unread_messages_count = 0
  markAsRead(conversationId).catch(() => {})
}

function handleRealtimeListUpdate(updatedConversation) {
  const idx = conversations.value.findIndex((c) => c.id == updatedConversation.id)
  if (idx === -1) return

  const existing = conversations.value[idx]

  existing.last_message = updatedConversation.last_message || existing.last_message
  existing.last_message_at = updatedConversation.last_message_at || existing.last_message_at

  if (currentConversationId.value !== updatedConversation.id) {
    existing.unread_messages_count = (existing.unread_messages_count || 0) + 1
  }

  conversations.value.splice(idx, 1)
  conversations.value.unshift(existing)
}

if (import.meta.env.VITE_PUSHER_APP_KEY) {
  useConversationRealtime({
    conversationId: currentConversationId,
    onMessageReceived: handleRealtimeMessage,
    onConversationListUpdated: handleRealtimeListUpdate,
    enableUserChannel: true,
  })
}

onMounted(async () => {
  await fetchConversations()
  const conversationId = props.id || route.params.id
  if (conversationId && conversations.value.length) {
    const conv = conversations.value.find(c => c.id == conversationId)
    if (conv) await selectConversation(conv)
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">My Conversations</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Chat with your doctors and healthcare providers</p>
        </div>
      </div>

      <!-- Chat Container -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden" style="height: calc(100vh - 220px); min-height: 500px;">
        <div class="flex h-full">

          <!-- Left Sidebar: Conversation List -->
          <div class="w-full sm:w-[380px] border-r border-slate-100 dark:border-slate-700 flex-col shrink-0"
            :class="mobileShowChat ? 'hidden sm:flex' : 'flex'">

            <!-- Search -->
            <div class="p-4 border-b border-slate-100 dark:border-slate-700">
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input v-model="searchQuery" type="text" placeholder="Search conversations..."
                  class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" />
              </div>
            </div>

            <!-- Conversation List -->
            <div class="flex-1 overflow-y-auto">
              <div v-if="loading" class="p-4 space-y-3">
                <div v-for="i in 5" :key="i" class="flex items-center gap-3 animate-pulse">
                  <div class="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-700 shrink-0"></div>
                  <div class="flex-1 space-y-2"><div class="h-3.5 w-28 bg-slate-100 dark:bg-slate-700 rounded"></div><div class="h-3 w-40 bg-slate-100 dark:bg-slate-700 rounded"></div></div>
                </div>
              </div>

              <div v-else-if="error" class="p-6 text-center">
                <span class="material-symbols-outlined text-3xl text-rose-400">error_outline</span>
                <p class="text-sm text-slate-500 mt-2">{{ error }}</p>
                <button class="mt-2 text-xs font-semibold text-brand-primary hover:underline cursor-pointer" @click="fetchConversations">Retry</button>
              </div>

              <div v-else-if="filteredConversations.length === 0" class="p-12 text-center">
                <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <span class="material-symbols-outlined text-3xl text-slate-400">forum</span>
                </div>
                <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {{ searchQuery ? 'No conversations found' : 'No conversations yet' }}
                </p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {{ searchQuery ? 'Try a different search term' : 'Start a chat from a doctor\'s profile' }}
                </p>
              </div>

              <template v-else>
                <button
                  v-for="conv in filteredConversations"
                  :key="conv.id"
                  class="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer"
                  :class="selectedConversation?.id === conv.id
                    ? 'bg-brand-primary/5 dark:bg-brand-primary/10 border-l-[3px] border-l-brand-primary'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/30 border-l-[3px] border-l-transparent'"
                  @click="selectConversation(conv)"
                >
                  <div class="relative shrink-0">
                    <div v-if="isSupportConversation(conv)" class="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <span class="material-symbols-outlined text-xl text-amber-600 dark:text-amber-400">support_agent</span>
                    </div>
                    <div v-else-if="getParticipantAvatar(conv)" class="w-11 h-11 rounded-full overflow-hidden">
                      <img :src="getParticipantAvatar(conv)" :alt="getParticipantName(conv)" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-11 h-11 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center">
                      <span class="text-sm font-bold text-white">{{ getInitial(getParticipantName(conv)) }}</span>
                    </div>
                    <div v-if="isParticipantOnline(conv)" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ getParticipantName(conv) }}</p>
                      <span class="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">{{ timeAgo(conv.last_message_at) }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-2 mt-0.5">
                      <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ conv.last_message?.message || 'No messages yet' }}</p>
                      <span v-if="conv.unread_messages_count > 0"
                        class="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-[10px] font-bold text-white">
                        {{ conv.unread_messages_count > 99 ? '99+' : conv.unread_messages_count }}
                      </span>
                    </div>
                  </div>
                </button>
              </template>
            </div>
          </div>

          <!-- Right Panel: Chat -->
          <div class="flex-1 flex-col min-w-0" :class="!mobileShowChat ? 'hidden sm:flex' : 'flex'">

            <!-- Chat Header -->
            <template v-if="selectedConversation">
              <div class="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 shrink-0">
                <button class="sm:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer" @click="goBack">
                  <span class="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <div class="relative shrink-0">
                  <div v-if="isSupportConversation(selectedConversation)" class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <span class="material-symbols-outlined text-lg text-amber-600 dark:text-amber-400">support_agent</span>
                  </div>
                  <div v-else-if="getParticipantAvatar(selectedConversation)" class="w-10 h-10 rounded-full overflow-hidden">
                    <img :src="getParticipantAvatar(selectedConversation)" :alt="getParticipantName(selectedConversation)" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center">
                    <span class="text-sm font-bold text-white">{{ getInitial(getParticipantName(selectedConversation)) }}</span>
                  </div>
                  <div v-if="isParticipantOnline(selectedConversation)" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ getParticipantName(selectedConversation) }}</p>
                  <p v-if="isParticipantOnline(selectedConversation)" class="text-[11px] text-emerald-500 font-medium">Online</p>
                  <p v-else class="text-[11px] text-slate-400 font-medium">Offline</p>
                </div>
              </div>
            </template>

            <!-- Messages -->
            <div v-if="selectedConversation" ref="messagesContainer" class="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-slate-50/50 dark:bg-slate-900/50" @scroll="onScroll">
              <div v-if="loadingMessages && !messages.length" class="flex items-center justify-center py-12">
                <div class="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <template v-else>
                <div v-if="loadingOlder" class="flex items-center justify-center py-3">
                  <div class="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div v-if="!messages.length" class="flex flex-col items-center justify-center py-16 text-center">
                  <div class="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-3xl text-brand-primary">chat</span>
                  </div>
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Start a conversation</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Send a message to {{ getParticipantName(selectedConversation) }}</p>
                </div>
                <template v-for="(msg, idx) in messages" :key="msg.id">
                  <div v-if="idx === 0 || !isSameDay(msg.created_at, messages[idx - 1]?.created_at)" class="flex items-center justify-center py-3">
                    <span class="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[11px] font-semibold text-slate-400 dark:text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700">
                      {{ formatDateSeparator(msg.created_at) }}
                    </span>
                  </div>
                  <div class="flex" :class="msg.is_me ? 'justify-end' : 'justify-start'">
                    <div class="flex flex-col max-w-[75%]" :class="msg.is_me ? 'items-end' : 'items-start'">
                      <div class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                        :class="msg.is_me
                          ? 'bg-brand-primary text-white rounded-br-md shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md shadow-sm border border-slate-100 dark:border-slate-700'">
                        {{ msg.message || msg.body || msg.content }}
                      </div>
                      <span class="text-[10px] mt-1 px-1 text-slate-400 dark:text-slate-500">
                        {{ formatMessageTime(msg.created_at) }}
                        <span v-if="msg.is_me" class="material-symbols-outlined text-[12px] align-middle ml-0.5 text-brand-primary">done_all</span>
                      </span>
                    </div>
                  </div>
                </template>
              </template>
            </div>

            <!-- Empty State -->
            <div v-else class="flex-1 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50">
              <div class="text-center">
                <div class="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span class="material-symbols-outlined text-4xl text-brand-primary">forum</span>
                </div>
                <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">Welcome to Messages</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">Select a conversation to start chatting</p>
              </div>
            </div>

            <!-- Input -->
            <div v-if="selectedConversation" class="px-5 py-3 border-t border-slate-100 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800">
              <form @submit.prevent="send" class="flex items-end gap-3">
                <div class="flex-1 relative">
                  <textarea v-model="newMessage" rows="1" placeholder="Type a message..."
                    class="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
                    @keydown.enter.exact.prevent="send" @input="autoResize" />
                </div>
                <button type="submit" :disabled="!newMessage.trim() || sending"
                  class="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-brand-primary-dark transition-all cursor-pointer shadow-sm hover:shadow-md">
                  <span v-if="sending" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-lg">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
