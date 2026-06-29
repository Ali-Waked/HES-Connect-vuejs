<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="show" class="fixed inset-0 z-[200] flex justify-end">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-xs" @click="$emit('close')" />

        <div class="relative flex flex-col w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700">
          <!-- Header -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div v-if="doctorAvatar" class="w-10 h-10 rounded-full overflow-hidden shrink-0">
              <img :src="doctorAvatar" :alt="doctorName" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-white font-bold text-sm shrink-0">
              {{ doctorName?.charAt(0) || 'D' }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ doctorName }}</h3>
              <p v-if="loading" class="text-xs text-slate-500 dark:text-slate-400">Connecting...</p>
              <p v-else-if="doctorOnline" class="text-xs text-emerald-500 font-medium">Online</p>
              <p v-else class="text-xs text-slate-400">Offline</p>
            </div>
            <button class="rounded-lg p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer" @click="$emit('close')">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto px-5 py-4 space-y-4" @scroll="onScroll">
            <div v-if="loadingMessages && !messages.length" class="flex items-center justify-center py-8">
              <div class="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>

            <div v-else-if="error && !messages.length" class="text-center py-8">
              <p class="text-sm text-red-500">{{ error }}</p>
              <button class="mt-2 text-xs text-brand-primary font-semibold cursor-pointer" @click="loadConversation">Retry</button>
            </div>

            <template v-else>
              <div v-if="loadingOlder" class="flex items-center justify-center py-3">
                <div class="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              </div>

              <div v-if="!messages.length" class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3">
                  <svg class="w-7 h-7 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>
                </div>
                <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Start a conversation</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Send a message to {{ doctorName }}</p>
              </div>

              <div v-for="msg in messages" :key="msg.id" class="flex" :class="msg.is_me ? 'justify-end' : 'justify-start'">
                <div class="flex flex-col max-w-[80%]" :class="msg.is_me ? 'items-end' : 'items-start'">
                  <div class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    :class="msg.is_me
                      ? 'bg-brand-primary text-white rounded-br-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'"
                  >{{ msg.message || msg.body || msg.content }}</div>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">{{ formatTime(msg.created_at) }}</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Input -->
          <div class="px-4 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <form @submit.prevent="send" class="flex items-end gap-2">
              <div class="flex-1 relative">
                <textarea
                  v-model="newMessage"
                  rows="1"
                  placeholder="Type a message..."
                  class="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                  @keydown.enter.exact.prevent="send"
                  @input="autoResize"
                />
              </div>
              <button
                type="submit"
                :disabled="!newMessage.trim() || sending"
                class="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-brand-primary-dark transition cursor-pointer"
              >
                <svg v-if="sending" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { findOrCreateConversation, getConversation, sendMessage, markAsRead } from '@/services/chatService'
import { useConversationRealtime } from '@/composables/useConversationRealtime'

const props = defineProps({
  show: Boolean,
  doctorUuid: { type: String, default: '' },
  doctorName: { type: String, default: '' },
  doctorAvatar: { type: String, default: '' }
})
const emit = defineEmits(['close'])

const auth = useAuthStore()

const messagesContainer = ref(null)
const conversationId = ref(null)
const participants = ref([])
const messages = ref([])
const newMessage = ref('')
const loading = ref(false)
const loadingMessages = ref(false)
const loadingOlder = ref(false)
const sending = ref(false)
const error = ref('')
const olderPage = ref(1)
const hasMoreOlder = ref(true)
const isInitialLoad = ref(true)

const doctorOnline = computed(() => {
  const doctor = participants.value.find(p => p.uuid === props.doctorUuid)
  return doctor?.is_online ?? false
})

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function autoResize(e) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

async function scrollToBottom(smooth = false) {
  await nextTick()
  const el = messagesContainer.value
  if (el) {
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant'
    })
  }
}

function isNearTop() {
  const el = messagesContainer.value
  if (!el) return false
  return el.scrollTop < 50
}

async function onScroll() {
  if (!isNearTop() || loadingOlder.value || !hasMoreOlder.value || !conversationId.value) return
  await loadOlderMessages()
}

async function loadOlderMessages() {
  if (!conversationId.value || loadingOlder.value || !hasMoreOlder.value) return

  loadingOlder.value = true
  const el = messagesContainer.value
  const prevScrollHeight = el ? el.scrollHeight : 0

  try {
    const { data } = await getConversation(conversationId.value, { page: olderPage.value })
    const rawMessages = data.messages?.data || data.messages || []
    const myUuid = auth.user?.uuid
    const older = rawMessages.map(m => ({
      ...m,
      is_me: m.sender?.uuid === myUuid,
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

async function loadMessages() {
  if (!conversationId.value) return
  loadingMessages.value = true
  try {
    const { data } = await getConversation(conversationId.value)
    const rawMessages = data.messages?.data || data.messages || []
    const myUuid = auth.user?.uuid
    messages.value = rawMessages
      .map(m => ({
        ...m,
        is_me: m.sender?.uuid === myUuid,
      }))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    if (rawMessages.length < 15) hasMoreOlder.value = false
    else { hasMoreOlder.value = true; olderPage.value = 2 }

    if (isInitialLoad.value) {
      await scrollToBottom()
      isInitialLoad.value = false
    }

    markAsRead(conversationId.value).catch(() => {})
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load messages'
  } finally {
    loadingMessages.value = false
  }
}

async function findOrCreate() {
  try {
    const { data } = await findOrCreateConversation({
      participant_ids: [props.doctorUuid],
      type: 'doctor_patient'
    })
    const conv = data.data || data
    conversationId.value = conv.id
    participants.value = conv.participants || []
    return true
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to start conversation'
    return false
  }
}

async function loadConversation() {
  if (!props.doctorUuid) return
  loading.value = true
  error.value = ''
  messages.value = []
  olderPage.value = 1
  hasMoreOlder.value = true
  isInitialLoad.value = true

  const found = await findOrCreate()

  if (conversationId.value) {
    await loadMessages()
  }
  loading.value = false
}

async function send() {
  const text = newMessage.value.trim()
  if (!text || sending.value) return

  if (!conversationId.value) {
    const created = await findOrCreate()
    if (!created) return
  }

  sending.value = true
  try {
    const { data } = await sendMessage(conversationId.value, { message: text })
    const msg = data.data || data
    const msgId = msg.id || Date.now()
    seenMessageIds.value.add(msgId)
    messages.value.push({
      id: msgId,
      message: text,
      is_me: true,
      created_at: new Date().toISOString()
    })
    newMessage.value = ''
    await scrollToBottom(true)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to send message'
  } finally {
    sending.value = false
  }
}

watch(() => props.show, (v) => {
  if (v && props.doctorUuid) {
    conversationId.value = null
    messages.value = []
    newMessage.value = ''
    error.value = ''
    loadConversation()
  }
})

/* ── Real-time ── */

const seenMessageIds = ref(new Set())

useConversationRealtime({
  conversationId,
  onMessageReceived: (event) => {
    if (!event) return
    const messageId = event.id
    if (messageId && seenMessageIds.value.has(messageId)) return
    if (messageId) seenMessageIds.value.add(messageId)

    const msg = {
      ...event,
      is_me: event.sender?.uuid === auth.user?.uuid,
    }

    messages.value = [...messages.value, msg].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    )

    nextTick(() => scrollToBottom(true))
    markAsRead(conversationId.value).catch(() => {})
  },
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.25s ease;
}
.slide-enter-active > div:last-child,
.slide-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
.slide-enter-from > div:last-child {
  transform: translateX(100%);
}
.slide-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
