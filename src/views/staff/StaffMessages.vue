<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useFormatDate } from '@/composables/useFormatDate'
import { resolveTranslatedValue } from '@/utils/locale'
import { getConversations, getConversation, sendMessage, markAsRead } from '@/services/chatService'

const { t, locale } = useI18n()
const auth = useAuthStore()
const { formatDate } = useFormatDate()

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

function getOtherParticipant(conv) {
  return conv.participants?.find(p => p.uuid !== myUuid.value) || conv.participants?.[0]
}

function getParticipantName(conv) {
  const other = getOtherParticipant(conv)
  return resolveTranslatedValue(other?.name, locale.value) || 'Unknown'
}

function getParticipantAvatar(conv) {
  const other = getOtherParticipant(conv)
  return other?.avatar || null
}

function getInitial(name) {
  if (!name || name === 'Unknown') return '?'
  return String(name).charAt(0).toUpperCase()
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
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false
  const a = new Date(d1)
  const b = new Date(d2)
  return a.toDateString() === b.toDateString()
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
    conversations.value = data.data || []
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
      .map(m => ({
        ...m,
        is_me: m.sender?.uuid === myUuid.value,
      }))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    if (rawMessages.length < 15) hasMoreOlder.value = false
    else { hasMoreOlder.value = true; olderPage.value = 2 }

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
    const older = rawMessages.map(m => ({
      ...m,
      is_me: m.sender?.uuid === myUuid.value,
    }))

    if (older.length === 0) {
      hasMoreOlder.value = false
    } else {
      messages.value = [...older, ...messages.value]
      olderPage.value++
      if (older.length < 15) hasMoreOlder.value = false
      await nextTick()
      if (el) el.scrollTop = el.scrollHeight - prevScrollHeight
    }
  } catch {
    hasMoreOlder.value = false
  } finally {
    loadingOlder.value = false
  }
}

function onScroll() {
  const el = messagesContainer.value
  if (!el || loadingOlder.value || !hasMoreOlder.value) return
  if (el.scrollTop < 50) loadOlderMessages()
}

async function scrollToBottom(smooth = false) {
  await nextTick()
  const el = messagesContainer.value
  if (el) {
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
  }
}

async function send() {
  const text = newMessage.value.trim()
  if (!text || sending.value || !selectedConversation.value) return

  sending.value = true
  try {
    const { data } = await sendMessage(selectedConversation.value.id, { message: text })
    const msg = data.data || data
    messages.value.push({
      id: msg.id || Date.now(),
      message: text,
      is_me: true,
      sender: { uuid: myUuid.value },
      created_at: new Date().toISOString()
    })
    newMessage.value = ''
    await scrollToBottom(true)

    if (selectedConversation.value) {
      selectedConversation.value.last_message = { message: text, created_at: new Date().toISOString() }
      selectedConversation.value.last_message_at = new Date().toISOString()
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to send message'
  } finally {
    sending.value = false
  }
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

onMounted(fetchConversations)
</script>

<template>
  <div class="animate-fade-in h-[calc(100vh-140px)]">
    <div class="flex h-full rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">

      <!-- Left Sidebar: Conversation List -->
      <div class="w-full sm:w-[380px] border-r border-slate-100 dark:border-slate-700 flex-col shrink-0"
        :class="mobileShowChat ? 'hidden sm:flex' : 'flex'">

        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Messages</h2>
            <span class="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
              {{ conversations.length }}
            </span>
          </div>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input v-model="searchQuery" type="text" placeholder="Search conversations..."
              class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition" />
          </div>
        </div>

        <!-- Conversation List -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading -->
          <div v-if="loading" class="p-4 space-y-3">
            <div v-for="i in 6" :key="i" class="flex items-center gap-3 animate-pulse">
              <div class="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-700 shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3.5 w-28 bg-slate-100 dark:bg-slate-700 rounded"></div>
                <div class="h-3 w-40 bg-slate-100 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="p-6 text-center">
            <span class="material-symbols-outlined text-3xl text-rose-400">error_outline</span>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">{{ error }}</p>
            <button class="mt-2 text-xs font-semibold text-brand-primary hover:underline cursor-pointer" @click="fetchConversations">Retry</button>
          </div>

          <!-- Empty -->
          <div v-else-if="filteredConversations.length === 0" class="p-6 text-center">
            <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">forum</span>
            <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-3">
              {{ searchQuery ? 'No conversations found' : 'No conversations yet' }}
            </p>
          </div>

          <!-- Items -->
          <template v-else>
            <button
              v-for="conv in filteredConversations"
              :key="conv.id"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all duration-150 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer"
              :class="selectedConversation?.id === conv.id
                ? 'bg-brand-primary/5 dark:bg-brand-primary/10 border-l-2 border-l-brand-primary'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/30 border-l-2 border-l-transparent'"
              @click="selectConversation(conv)"
            >
              <!-- Avatar -->
              <div class="relative shrink-0">
                <div v-if="getParticipantAvatar(conv)" class="w-11 h-11 rounded-full overflow-hidden">
                  <img :src="getParticipantAvatar(conv)" :alt="getParticipantName(conv)" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-11 h-11 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center">
                  <span class="text-sm font-bold text-white">{{ getInitial(getParticipantName(conv)) }}</span>
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ getParticipantName(conv) }}</p>
                  <span class="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">{{ timeAgo(conv.last_message_at) }}</span>
                </div>
                <div class="flex items-center justify-between gap-2 mt-0.5">
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {{ conv.last_message?.message || 'No messages yet' }}
                  </p>
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

      <!-- Right Panel: Chat Area -->
      <div class="flex-1 flex-col min-w-0" :class="!mobileShowChat ? 'hidden sm:flex' : 'flex'">

        <!-- Chat Header -->
        <template v-if="selectedConversation">
          <div class="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 shrink-0">
            <button class="sm:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer" @click="goBack">
              <span class="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div class="relative shrink-0">
              <div v-if="getParticipantAvatar(selectedConversation)" class="w-10 h-10 rounded-full overflow-hidden">
                <img :src="getParticipantAvatar(selectedConversation)" :alt="getParticipantName(selectedConversation)" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center">
                <span class="text-sm font-bold text-white">{{ getInitial(getParticipantName(selectedConversation)) }}</span>
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ getParticipantName(selectedConversation) }}</p>
              <p class="text-[11px] text-emerald-500 font-medium">Online</p>
            </div>
          </div>
        </template>

        <!-- Messages Area -->
        <div v-if="selectedConversation" ref="messagesContainer" class="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-slate-50/50 dark:bg-slate-900/50" @scroll="onScroll">
          <!-- Loading Messages -->
          <div v-if="loadingMessages && !messages.length" class="flex items-center justify-center py-12">
            <div class="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <template v-else>
            <!-- Loading older -->
            <div v-if="loadingOlder" class="flex items-center justify-center py-3">
              <div class="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Empty -->
            <div v-if="!messages.length" class="flex flex-col items-center justify-center py-16 text-center">
              <div class="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
                <span class="material-symbols-outlined text-3xl text-brand-primary">chat</span>
              </div>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Start a conversation</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Send a message to {{ getParticipantName(selectedConversation) }}</p>
            </div>

            <!-- Messages -->
            <template v-for="(msg, idx) in messages" :key="msg.id">
              <!-- Date separator -->
              <div v-if="idx === 0 || !isSameDay(msg.created_at, messages[idx - 1]?.created_at)"
                class="flex items-center justify-center py-3">
                <span class="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-[11px] font-semibold text-slate-400 dark:text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700">
                  {{ formatDateSeparator(msg.created_at) }}
                </span>
              </div>

              <!-- Message bubble -->
              <div class="flex" :class="msg.is_me ? 'justify-end' : 'justify-start'">
                <div class="flex flex-col max-w-[75%]" :class="msg.is_me ? 'items-end' : 'items-start'">
                  <div class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    :class="msg.is_me
                      ? 'bg-brand-primary text-white rounded-br-md shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md shadow-sm border border-slate-100 dark:border-slate-700'">
                    {{ msg.message || msg.body || msg.content }}
                  </div>
                  <span class="text-[10px] mt-1 px-1" :class="msg.is_me ? 'text-slate-400 dark:text-slate-500' : 'text-slate-400 dark:text-slate-500'">
                    {{ formatMessageTime(msg.created_at) }}
                    <span v-if="msg.is_me" class="material-symbols-outlined text-[12px] align-middle ml-0.5 text-brand-primary">done_all</span>
                  </span>
                </div>
              </div>
            </template>
          </template>
        </div>

        <!-- Empty State (no conversation selected) -->
        <div v-else class="flex-1 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50">
          <div class="text-center">
            <div class="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-4xl text-brand-primary">forum</span>
            </div>
            <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">Welcome to Messages</p>
            <p class="text-sm text-slate-500 dark:text-slate-400">Select a conversation to start chatting</p>
          </div>
        </div>

        <!-- Input Area -->
        <div v-if="selectedConversation" class="px-5 py-3 border-t border-slate-100 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800">
          <form @submit.prevent="send" class="flex items-end gap-3">
            <div class="flex-1 relative">
              <textarea
                v-model="newMessage"
                rows="1"
                placeholder="Type a message..."
                class="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                @keydown.enter.exact.prevent="send"
                @input="autoResize"
              />
            </div>
            <button
              type="submit"
              :disabled="!newMessage.trim() || sending"
              class="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-brand-primary-dark transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <span v-if="sending" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              <span v-else class="material-symbols-outlined text-lg">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
