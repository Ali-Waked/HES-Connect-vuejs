<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePatientAiStore } from '@/stores/patientAi'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import AppNavbar from '@/components/global/AppNavbar.vue'
import PublicToastContainer from '@/components/global/PublicToastContainer.vue'
import { usePublicToast } from '@/composables/usePublicToast'

const { addToast } = usePublicToast()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store = usePatientAiStore()

const input = ref('')
const messagesContainer = ref(null)
const textareaRef = ref(null)
const mobileShowChat = ref(false)
const showDeleteModal = ref(false)
const showNewConversationModal = ref(false)
const isEditingTitle = ref(false)
const editTitleInput = ref('')
const showSummaryPanel = ref(true)

const suggestedPrompts = [
  { text: 'I have chest pain', icon: 'favorite', color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-50 dark:bg-rose-950/30', borderColor: 'border-rose-200 dark:border-rose-800' },
  { text: 'My child has fever', icon: 'thermostat', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-50 dark:bg-amber-950/30', borderColor: 'border-amber-200 dark:border-amber-800' },
  { text: 'I feel dizzy', icon: 'balance', color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-50 dark:bg-violet-950/30', borderColor: 'border-violet-200 dark:border-violet-800' },
  { text: 'I have a skin rash', icon: 'visibility', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-50 dark:bg-pink-950/30', borderColor: 'border-pink-200 dark:border-pink-800' },
  { text: 'I have a headache', icon: 'psychology', color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-blue-200 dark:border-blue-800' },
  { text: 'I have stomach pain', icon: 'gastroenterology', color: 'from-brand-primary to-brand-accent', bgColor: 'bg-brand-primary-light dark:bg-brand-primary/10', borderColor: 'border-brand-primary/30 dark:border-brand-primary/60' },
]

marked.setOptions({ breaks: true, gfm: true })

function renderMarkdown(text) {
  if (!text) return ''
  try {
    return DOMPurify.sanitize(marked.parse(text))
  } catch {
    return text
  }
}

function getMessageDir(content) {
  if (!content) return 'ltr'
  const firstChar = content.trim().charAt(0)
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(firstChar) ? 'rtl' : 'ltr'
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return t('aiConsultation.now')
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMessageTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getConversationPreview(conv) {
  return conv.last_message_preview || t('aiConsultation.noMessages')
}

function getConversationTitle(conv) {
  if (conv.title) return conv.title
  return t('aiConsultation.defaultTitle')
}

async function scrollToBottom(smooth = false) {
  await nextTick()
  const el = messagesContainer.value
  if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
}

function autoResize(e) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

async function send() {
  const text = input.value.trim()
  if (!text || store.sending) return

  input.value = ''
  if (textareaRef.value) textareaRef.value.style.height = 'auto'

  if (!store.activeConversationUuid) {
    const conv = await store.createConversation()
    if (!conv) return
    mobileShowChat.value = true
    router.replace({ name: 'ai-consultation', params: { id: conv.uuid } })
  }

  await store.sendMessage(text)
  await scrollToBottom(true)

  if (store.requiresNewConversation) {
    showNewConversationModal.value = true
  }
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function usePrompt(prompt) {
  input.value = prompt
  textareaRef.value?.focus()
}

async function createNewConversation() {
  const conv = await store.createConversation()
  if (conv) {
    mobileShowChat.value = true
    router.replace({ name: 'ai-consultation', params: { id: conv.uuid } })
  }
}

async function selectConversation(conv) {
  await store.selectConversation(conv.uuid)
  mobileShowChat.value = true
  router.replace({ name: 'ai-consultation', params: { id: conv.uuid } })
  await scrollToBottom()
}

function goBack() {
  mobileShowChat.value = false
  store.clearActiveConversation()
  router.replace({ name: 'ai-consultation' })
}

function startRename() {
  editTitleInput.value = store.activeConversation?.title || ''
  isEditingTitle.value = true
  nextTick(() => {
    const el = document.querySelector('.rename-input')
    if (el) { el.focus(); el.select() }
  })
}

async function saveRename() {
  const title = editTitleInput.value.trim()
  if (title && store.activeConversationUuid) {
    await store.renameConversation(store.activeConversationUuid, title)
  }
  isEditingTitle.value = false
}

function cancelRename() {
  isEditingTitle.value = false
}

function confirmDelete() {
  showDeleteModal.value = true
}

async function executeDelete() {
  if (store.activeConversationUuid) {
    await store.deleteConversation(store.activeConversationUuid)
    showDeleteModal.value = false
    mobileShowChat.value = false
    router.replace({ name: 'ai-consultation' })
    addToast(t('aiConsultation.deleteSuccess'), 'success')
  }
}

async function handleNewConversationFromModal() {
  showNewConversationModal.value = false
  store.clearActiveConversation()
  const conv = await store.createConversation()
  if (conv) {
    mobileShowChat.value = true
    router.replace({ name: 'ai-consultation', params: { id: conv.uuid } })
  }
}

async function onScroll() {
  const el = messagesContainer.value
  if (!el || store.loadingOlder || !store.hasMoreOlder) return
  if (el.scrollTop < 50) {
    const prevHeight = el.scrollHeight
    const older = await store.loadOlderMessages()
    if (older?.length > 0) {
      await nextTick()
      el.scrollTop = el.scrollHeight - prevHeight
    }
  }
}

function bookAppointment(doctor) {
  const uuid = doctor.uuid || doctor.id
  window.open(`/doctors/${uuid}`, '_blank')
}

function viewProfile(doctor) {
  const uuid = doctor.uuid || doctor.id
  window.open(`/doctors/${uuid}`, '_blank')
}

function askFollowUp(question) {
  input.value = question
  nextTick(() => send())
}

async function handleRecommendDoctor() {
  await store.requestDoctorRecommendation()
}

watch(() => store.messages.length, () => scrollToBottom(true))
watch(() => store.sending, () => scrollToBottom(true))

watch(() => route.params.id, async (id) => {
  if (id && id !== store.activeConversationUuid) {
    await store.selectConversation(id)
    mobileShowChat.value = true
    await scrollToBottom()
  }
}, { immediate: true })

onMounted(async () => {
  await store.fetchConversations()
  const uuid = route.params.id
  if (uuid) {
    await store.selectConversation(uuid)
    mobileShowChat.value = true
    await scrollToBottom()
  }
})

const urgencyConfig = computed(() => ({
  low: {
    bg: 'bg-brand-primary-light dark:bg-brand-primary/10',
    text: 'text-brand-primary dark:text-brand-accent',
    dot: 'bg-brand-primary',
    border: 'border-brand-primary/30 dark:border-brand-primary/60',
    icon: 'check_circle',
    label: t('aiConsultation.urgency.low'),
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'warning',
    label: t('aiConsultation.urgency.medium'),
  },
  high: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
    border: 'border-red-200 dark:border-red-800',
    icon: 'emergency',
    label: t('aiConsultation.urgency.high'),
  },
}))
</script>

<template>
  <div class="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans antialiased overflow-hidden">
    <AppNavbar variant="landing" />

    <main class="flex-1 flex flex-col min-h-0 mt-16 lg:mt-[68px]">
      <div class="flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full min-h-0">

        <!-- ==================== SIDEBAR ==================== -->
        <aside
          class="w-full sm:w-[320px] lg:w-[340px] flex-col shrink-0 border-r border-slate-200/60 dark:border-slate-700/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
          :class="mobileShowChat ? 'hidden sm:flex' : 'flex'"
        >
          <div class="p-5 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/20">
                  <span class="material-symbols-outlined text-white text-xl">neurology</span>
                </div>
                <div>
                  <h1 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('aiConsultation.assistantTitle') }}</h1>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ t('aiConsultation.assistantSubtitle') }}</p>
                </div>
              </div>
              <button
                class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent text-white flex items-center justify-center shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all duration-300 hover:scale-105 cursor-pointer"
                @click="createNewConversation"
                :title="t('aiConsultation.newConsultation')"
              >
                <span class="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                :placeholder="t('aiConsultation.searchPlaceholder')"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
              />
            </div>
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto">
            <div v-if="store.conversationsLoading" class="p-4 space-y-3">
              <div v-for="i in 5" :key="i" class="animate-pulse">
                <div class="flex items-center gap-3 p-3 rounded-xl">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-3.5 w-28 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
                    <div class="h-3 w-40 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="store.conversations.length === 0" class="p-8 text-center">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary-light to-brand-primary-lighter dark:from-brand-primary/10 dark:to-brand-accent/10 flex items-center justify-center mx-auto mb-4 border border-brand-primary/20 dark:border-brand-primary/70">
                <span class="material-symbols-outlined text-3xl text-brand-primary">chat_bubble_outline</span>
              </div>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ t('aiConsultation.noConsultations') }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-[200px] mx-auto">{{ t('aiConsultation.noConsultationsDesc') }}</p>
            </div>

            <div v-else class="p-2 space-y-1">
              <button
                v-for="conv in store.conversations"
                :key="conv.uuid"
                class="w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl transition-all duration-200 cursor-pointer group"
                :class="store.activeConversationUuid === conv.uuid
                  ? 'bg-gradient-to-r from-brand-primary-light to-brand-primary-lighter dark:from-brand-primary/15 dark:to-brand-accent/15 border border-brand-primary/30 dark:border-brand-primary/60 shadow-sm'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'"
                @click="selectConversation(conv)"
              >
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                  :class="store.activeConversationUuid === conv.uuid
                    ? 'bg-gradient-to-br from-brand-primary to-brand-accent shadow-md shadow-brand-primary/20'
                    : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'"
                >
                  <span
                    class="material-symbols-outlined text-lg"
                    :class="store.activeConversationUuid === conv.uuid ? 'text-white' : 'text-slate-500 dark:text-slate-400'"
                  >stethoscope</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <p
                      class="text-sm font-semibold truncate"
                      :class="store.activeConversationUuid === conv.uuid
                        ? 'text-brand-primary dark:text-brand-accent'
                        : 'text-slate-800 dark:text-slate-200'"
                    >{{ getConversationTitle(conv) }}</p>
                    <span class="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">{{ timeAgo(conv.last_activity_at || conv.updated_at) }}</span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{{ getConversationPreview(conv) }}</p>
                </div>
              </button>
            </div>
          </div>

          <div class="p-4 border-t border-slate-100 dark:border-slate-800">
            <button
              class="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-brand-primary/25 hover:scale-[1.02] cursor-pointer"
              @click="createNewConversation"
            >
              <span class="material-symbols-outlined text-lg">add</span>
              {{ t('aiConsultation.newConsultation') }}
            </button>
          </div>
        </aside>

        <!-- ==================== MAIN CHAT AREA ==================== -->
        <div class="flex-1 flex flex-col min-w-0" :class="!mobileShowChat ? 'hidden sm:flex' : 'flex'">

          <!-- Chat Header -->
          <div class="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-slate-200/60 dark:border-slate-700/40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shrink-0">
            <button class="sm:hidden p-2 text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent rounded-xl hover:bg-brand-primary-light dark:hover:bg-brand-primary/10 transition-all cursor-pointer" @click="goBack">
              <span class="material-symbols-outlined text-xl">arrow_back</span>
            </button>

            <div v-if="store.activeConversation" class="flex-1 min-w-0 flex items-center gap-2">
              <div v-if="isEditingTitle" class="flex items-center gap-2 flex-1">
                <input
                  v-model="editTitleInput"
                  class="rename-input flex-1 rounded-xl border border-brand-primary/40 dark:border-brand-primary/50 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
                  @keydown.enter="saveRename"
                  @keydown.escape="cancelRename"
                />
                <button class="p-2 text-brand-primary hover:bg-brand-primary-light dark:hover:bg-brand-primary/10 rounded-xl transition-all cursor-pointer" @click="saveRename">
                  <span class="material-symbols-outlined text-lg">check</span>
                </button>
                <button class="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer" @click="cancelRename">
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <template v-else>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center">
                    <span class="material-symbols-outlined text-white text-sm">stethoscope</span>
                  </div>
                  <h2 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ getConversationTitle(store.activeConversation) }}</h2>
                </div>
                <button class="p-1.5 text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent rounded-lg hover:bg-brand-primary-light dark:hover:bg-brand-primary/10 transition-all cursor-pointer" @click="startRename" :title="t('aiConsultation.rename')">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </template>
            </div>
            <div v-else class="flex-1 flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-sm">neurology</span>
              </div>
              <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('aiConsultation.heroTitle') }}</h2>
            </div>

            <div v-if="store.activeConversation" class="flex items-center gap-1">
              <button
                v-if="store.patientSummary?.symptoms?.length > 0"
                class="p-2 text-slate-400 hover:text-brand-primary dark:hover:text-brand-accent rounded-xl hover:bg-brand-primary-light dark:hover:bg-brand-primary/10 transition-all cursor-pointer"
                @click="showSummaryPanel = !showSummaryPanel"
                :title="t('aiConsultation.toggleSummary')"
              >
                <span class="material-symbols-outlined text-lg">view_sidebar</span>
              </button>
              <button class="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer" @click="confirmDelete" :title="t('aiConsultation.delete')">
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>

          <!-- ==================== MESSAGES + SUMMARY LAYOUT ==================== -->
          <div class="flex-1 flex min-h-0 overflow-hidden">
            <!-- Messages Column -->
            <div class="flex-1 flex flex-col min-w-0">
              <div
                v-if="store.activeConversationUuid"
                ref="messagesContainer"
                class="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth"
                @scroll="onScroll"
              >
                <div v-if="store.loading && !store.messages.length" class="flex flex-col items-center justify-center py-20">
                  <div class="relative">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/30">
                      <span class="material-symbols-outlined text-white text-3xl">neurology</span>
                    </div>
                    <div class="absolute -inset-2 rounded-3xl border-2 border-brand-primary/20 animate-ping"></div>
                  </div>
                  <p class="mt-6 text-sm font-semibold text-slate-600 dark:text-slate-400">{{ t('aiConsultation.loadingConversation') }}</p>
                </div>

                <template v-else>
                  <div v-if="store.loadingOlder" class="flex items-center justify-center py-4">
                    <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div class="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                      <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ t('aiConsultation.loadingOlder') }}</span>
                    </div>
                  </div>

                  <div v-if="!store.messages.length" class="flex flex-col items-center justify-center py-12 text-center">
                    <div class="relative mb-6">
                      <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-xl shadow-brand-primary/30">
                        <span class="material-symbols-outlined text-white text-4xl">neurology</span>
                      </div>
                      <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center">
                        <span class="material-symbols-outlined text-brand-primary text-lg">auto_awesome</span>
                      </div>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('aiConsultation.howCanIHelp') }}</h3>
                    <p class="max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {{ t('aiConsultation.describeSymptoms') }}
                    </p>
                    <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <span class="material-symbols-outlined text-amber-500 text-sm">info</span>
                      <span class="text-[11px] font-medium text-amber-700 dark:text-amber-300">{{ t('aiConsultation.heroDisclaimer') }}</span>
                    </div>
                  </div>

                  <div class="max-w-3xl mx-auto space-y-6">
                    <template v-for="(msg, idx) in store.messages" :key="msg.uuid || idx">
                      <!-- User Message -->
                      <div v-if="msg.role === 'user'" class="flex justify-end">
                        <div class="max-w-[80%] sm:max-w-[70%]">
                          <div class="rounded-2xl rounded-br-md px-5 py-3 text-sm leading-relaxed bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white shadow-lg shadow-brand-primary/20 whitespace-pre-wrap">
                            {{ msg.content }}
                          </div>
                          <p class="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-1.5 px-1 tabular-nums">
                            {{ formatMessageTime(msg.created_at) }}
                          </p>
                        </div>
                      </div>

                      <!-- Assistant Message -->
                      <div v-else class="flex gap-3">
                        <div class="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 shadow-sm">
                          <span class="material-symbols-outlined text-[18px]">neurology</span>
                        </div>
                        <div class="max-w-[85%] sm:max-w-[75%] space-y-2">
                          <div
                            v-if="msg.isError"
                            class="rounded-2xl rounded-tl-md px-5 py-3 text-sm leading-relaxed bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                          >
                            <div class="flex items-center gap-2 mb-1">
                              <span class="material-symbols-outlined text-red-500 text-sm">error</span>
                              <span class="text-xs font-semibold text-red-600 dark:text-red-400">{{ t('aiConsultation.error') }}</span>
                            </div>
                            {{ msg.content }}
                          </div>
                          <div
                            v-else
                            class="rounded-2xl rounded-tl-md px-5 py-3.5 text-sm leading-relaxed bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700/50"
                            :dir="getMessageDir(msg.content)"
                          >
                            <div class="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-slate-900 dark:prose-strong:text-white prose-headings:text-slate-900 dark:prose-headings:text-white" v-html="renderMarkdown(msg.content)"></div>
                          </div>

                          <p class="text-[10px] text-slate-400 dark:text-slate-500 px-1 tabular-nums">
                            {{ formatMessageTime(msg.created_at) }}
                          </p>
                        </div>
                      </div>

                      <!-- Per-message follow-up chips -->
                      <div v-if="msg.role === 'assistant' && !msg.isError && msg.followUpQuestions?.length > 0" class="ml-12 space-y-2">
                        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('aiConsultation.suggestedFollowUps') }}</p>
                        <div class="flex flex-wrap gap-2">
                          <button
                            v-for="q in msg.followUpQuestions"
                            :key="q"
                            class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all duration-200 hover:border-brand-primary/50 dark:hover:border-brand-primary/60 hover:text-brand-primary dark:hover:text-brand-accent hover:bg-brand-primary-light dark:hover:bg-brand-primary/10 hover:shadow-sm whitespace-nowrap cursor-pointer"
                            @click="askFollowUp(q)"
                          >
                            <span class="material-symbols-outlined text-sm mr-1 align-middle">arrow_forward</span>
                            {{ q }}
                          </button>
                        </div>
                      </div>
                    </template>
                  </div>

                  <!-- Typing indicator -->
                  <div v-if="store.sending" class="max-w-3xl mx-auto">
                    <div class="flex gap-3">
                      <div class="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 shadow-sm">
                        <span class="material-symbols-outlined text-[18px]">neurology</span>
                      </div>
                      <div class="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-white dark:bg-slate-800 px-5 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700/50">
                        <span class="h-2 w-2 animate-bounce rounded-full bg-brand-primary" style="animation-delay:0ms" />
                        <span class="h-2 w-2 animate-bounce rounded-full bg-brand-primary" style="animation-delay:150ms" />
                        <span class="h-2 w-2 animate-bounce rounded-full bg-brand-accent" style="animation-delay:300ms" />
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- ==================== EMPTY STATE ==================== -->
              <div v-else class="flex-1 flex justify-center min-h-0 overflow-y-auto">
                <div class="text-center px-6 py-8 my-auto">
                  <div class="relative inline-block mb-8">
                    <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-primary via-brand-accent to-brand-primary-dark flex items-center justify-center shadow-2xl shadow-brand-primary/30">
                      <span class="material-symbols-outlined text-white text-5xl">neurology</span>
                    </div>
                    <div class="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-lg animate-bounce" style="animation-duration: 2s">
                      <span class="material-symbols-outlined text-amber-500 text-xl">auto_awesome</span>
                    </div>
                    <div class="absolute -bottom-2 -left-2 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-lg">
                      <span class="material-symbols-outlined text-brand-primary text-xl">health_and_safety</span>
                    </div>
                  </div>

                  <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                    {{ t('aiConsultation.heroTitle') }}
                  </h2>
                  <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed mb-3">
                    {{ t('aiConsultation.heroDesc') }}
                  </p>

                  <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-10">
                    <span class="material-symbols-outlined text-amber-500 text-sm">info</span>
                    <span class="text-[11px] font-medium text-amber-700 dark:text-amber-300">AI-generated insights — not a substitute for professional medical advice</span>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                    <button
                      v-for="prompt in suggestedPrompts"
                      :key="prompt.text"
                      class="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group backdrop-blur-sm"
                      :class="prompt.borderColor"
                      @click="usePrompt(prompt.text)"
                    >
                      <div
                        class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg bg-gradient-to-br text-white shadow-md"
                        :class="prompt.color"
                      >
                        <span class="material-symbols-outlined text-xl">{{ prompt.icon }}</span>
                      </div>
                      <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors">{{ prompt.text }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- ==================== COMPOSER ==================== -->
              <div class="shrink-0 border-t border-slate-200/60 dark:border-slate-700/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 py-4">
                <div class="max-w-3xl mx-auto">
                  <div class="relative flex items-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 transition-all duration-200">
                    <textarea
                      ref="textareaRef"
                      v-model="input"
                      :placeholder="t('aiConsultation.inputPlaceholder')"
                      class="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                      rows="1"
                      :disabled="store.sending"
                      @keydown="onKeydown"
                      @input="autoResize"
                    />
                    <button
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white transition-all duration-200 hover:shadow-lg hover:shadow-brand-primary/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
                      :disabled="!input.trim() || store.sending"
                      @click="send"
                    >
                      <span v-if="store.sending" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      <span v-else class="material-symbols-outlined text-lg rtl:rotate-180">send</span>
                    </button>
                  </div>
                  <p class="mt-2 text-[10px] text-slate-400 dark:text-slate-500 text-center">
                    {{ t('aiConsultation.sendHint') }} <kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">Enter</kbd> {{ t('aiConsultation.toSend') }} <kbd class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">Shift+Enter</kbd> {{ t('aiConsultation.newLine') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- ==================== RIGHT SUMMARY PANEL ==================== -->
            <aside
              v-if="showSummaryPanel && store.activeConversationUuid"
              class="hidden lg:flex w-[340px] xl:w-[380px] flex-col shrink-0 border-l border-slate-200/60 dark:border-slate-700/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-y-auto"
            >
              <!-- Patient Summary Card -->
              <div class="p-5 border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-2 mb-4">
                  <span class="material-symbols-outlined text-brand-primary text-lg">medical_information</span>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('aiConsultation.patientSummary') }}</h3>
                </div>

                <div v-if="store.patientSummary?.symptoms?.length > 0" class="space-y-4">
                  <!-- Symptoms -->
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{{ t('aiConsultation.symptoms') }}</p>
                    <div class="flex flex-wrap gap-1.5">
                      <span
                        v-for="(symptom, i) in store.patientSummary.symptoms"
                        :key="i"
                        class="inline-flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:text-red-300"
                      >
                        <span class="material-symbols-outlined text-[12px]">sick</span>
                        {{ symptom }}
                      </span>
                    </div>
                  </div>

                  <!-- Urgency -->
                  <div v-if="store.patientSummary.urgency">
                    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{{ t('aiConsultation.urgencyLabel') }}</p>
                    <div
                      class="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold border"
                      :class="[
                        urgencyConfig[store.patientSummary.urgency]?.bg || 'bg-slate-100 dark:bg-slate-800',
                        urgencyConfig[store.patientSummary.urgency]?.border || 'border-slate-200 dark:border-slate-700'
                      ]"
                    >
                      <span class="material-symbols-outlined text-sm" :class="urgencyConfig[store.patientSummary.urgency]?.text || 'text-slate-500'">
                        {{ urgencyConfig[store.patientSummary.urgency]?.icon || 'info' }}
                      </span>
                      <span :class="urgencyConfig[store.patientSummary.urgency]?.text || 'text-slate-600 dark:text-slate-400'">
                        {{ urgencyConfig[store.patientSummary.urgency]?.label || store.patientSummary.urgency }}
                      </span>
                    </div>
                  </div>

                  <!-- Specialty -->
                  <div v-if="store.patientSummary.specialty">
                    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{{ t('aiConsultation.suggestedSpecialty') }}</p>
                    <div class="inline-flex items-center gap-2 rounded-xl bg-brand-primary-light dark:bg-brand-primary/10 border border-brand-primary/30 dark:border-brand-primary/60 px-3 py-1.5">
                      <span class="material-symbols-outlined text-brand-primary text-sm">local_hospital</span>
                      <span class="text-xs font-bold text-brand-primary dark:text-brand-accent">{{ store.patientSummary.specialty }}</span>
                    </div>
                  </div>

                  <!-- Confidence -->
                  <div v-if="store.patientSummary.confidence">
                    <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{{ t('aiConsultation.confidence') }}</p>
                    <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all duration-500"
                        :class="store.patientSummary.confidence >= 0.7 ? 'bg-green-500' : store.patientSummary.confidence >= 0.4 ? 'bg-amber-500' : 'bg-red-500'"
                        :style="{ width: (store.patientSummary.confidence * 100) + '%' }"
                      ></div>
                    </div>
                    <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{{ Math.round(store.patientSummary.confidence * 100) }}%</p>
                  </div>
                </div>

                <div v-else class="text-center py-6">
                  <span class="material-symbols-outlined text-slate-300 dark:text-slate-600 text-3xl mb-2">health_and_safety</span>
                  <p class="text-xs text-slate-400 dark:text-slate-500">{{ t('aiConsultation.summaryCollecting') }}</p>
                </div>
              </div>

              <!-- Find the Right Doctor Button -->
              <div v-if="store.activeConversationUuid" class="p-5 border-b border-slate-100 dark:border-slate-800">
                <button
                  v-if="store.canRequestRecommendation && !store.showDoctorRecommendation"
                  class="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-brand-primary/25 hover:scale-[1.02] cursor-pointer"
                  :disabled="store.loadingDoctors"
                  @click="handleRecommendDoctor"
                >
                  <span v-if="store.loadingDoctors" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-lg">search</span>
                  {{ store.loadingDoctors ? t('aiConsultation.searching') : t('aiConsultation.findRightDoctor') }}
                </button>

                <div v-else-if="!store.canRequestRecommendation && store.activeConversation" class="text-center py-2">
                  <p class="text-[11px] text-slate-400 dark:text-slate-500">
                    {{ t('aiConsultation.needMoreInfo') }}
                  </p>
                </div>
              </div>

              <!-- Doctor Recommendations -->
              <div v-if="store.showDoctorRecommendation" class="p-5 space-y-4">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-brand-primary text-lg">medical_services</span>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('aiConsultation.recommendedDoctors') }}</h3>
                </div>

                <div v-if="store.doctorRecommendationError" class="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
                  <p class="text-xs text-red-600 dark:text-red-400">{{ store.doctorRecommendationError }}</p>
                </div>

                <div v-else-if="store.recommendedDoctors.length === 0" class="text-center py-6">
                  <span class="material-symbols-outlined text-slate-300 dark:text-slate-600 text-3xl mb-2">person_off</span>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('aiConsultation.noDoctorsAvailable') }}</p>
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="doc in store.recommendedDoctors"
                    :key="doc.uuid"
                    class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 transition-all duration-300 hover:shadow-lg hover:border-brand-primary/30 dark:hover:border-brand-primary/60"
                  >
                    <div class="flex items-start gap-3">
                      <div v-if="doc.photo" class="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        <img :src="doc.photo" :alt="doc.name" class="w-full h-full object-cover" />
                      </div>
                      <div v-else class="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shrink-0 shadow-md shadow-brand-primary/20">
                        <span class="text-lg font-bold text-white">{{ (doc.name || 'Dr.').charAt(0) }}</span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ doc.name }}</p>
                        <p class="text-xs text-brand-primary dark:text-brand-accent font-semibold">{{ doc.specialty }}</p>
                        <p v-if="doc.department" class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ doc.department }}</p>
                        <div class="flex items-center gap-2 mt-1">
                          <span v-if="doc.facility?.name" class="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <span class="material-symbols-outlined text-[12px]">location_on</span>
                            {{ doc.facility.name }}
                          </span>
                        </div>
                        <div class="flex items-center gap-3 mt-1.5">
                          <span v-if="doc.experience_years" class="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <span class="material-symbols-outlined text-[12px]">work_history</span>
                            {{ doc.experience_years }} {{ t('aiConsultation.yearsExp') }}
                          </span>
                          <span
                            class="text-[11px] font-semibold flex items-center gap-1"
                            :class="doc.is_available ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'"
                          >
                            <span class="w-1.5 h-1.5 rounded-full" :class="doc.is_available ? 'bg-green-500' : 'bg-slate-400'"></span>
                            {{ doc.is_available ? t('aiConsultation.available') : t('aiConsultation.unavailable') }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-2 mt-3">
                      <button
                        class="flex-1 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-4 py-2 text-[11px] font-bold text-white transition-all duration-200 hover:shadow-md hover:shadow-brand-primary/25 hover:scale-[1.02] cursor-pointer"
                        @click="bookAppointment(doc)"
                      >
                        {{ t('aiConsultation.bookAppointment') }}
                      </button>
                      <button
                        class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-all duration-200 hover:border-brand-primary/50 dark:hover:border-brand-primary/60 hover:text-brand-primary dark:hover:text-brand-accent cursor-pointer"
                        @click="viewProfile(doc)"
                      >
                        {{ t('aiConsultation.viewProfile') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Disclaimer -->
              <div class="p-5 mt-auto">
                <div class="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                  <div class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-amber-500 text-sm mt-0.5">info</span>
                    <p class="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                      {{ t('aiConsultation.triageDisclaimer') }}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>

    <!-- ==================== DELETE MODAL ==================== -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showDeleteModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-8">
            <div class="flex items-center gap-4 mb-5">
              <div class="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center border border-red-200 dark:border-red-800">
                <span class="material-symbols-outlined text-2xl text-red-500">delete</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('aiConsultation.deleteTitle') }}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('aiConsultation.deleteWarning') }}</p>
              </div>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {{ t('aiConsultation.deleteConfirm') }}
            </p>
            <div class="flex gap-3 justify-end">
              <button class="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer" @click="showDeleteModal = false">{{ t('aiConsultation.cancel') }}</button>
              <button class="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all cursor-pointer" @click="executeDelete">{{ t('aiConsultation.delete') }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ==================== LIMIT MODAL ==================== -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showNewConversationModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showNewConversationModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-8">
            <div class="flex items-center gap-4 mb-5">
              <div class="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <span class="material-symbols-outlined text-2xl text-amber-500">warning</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('aiConsultation.limitTitle') }}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('aiConsultation.limitDesc') }}</p>
              </div>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {{ t('aiConsultation.limitMessage') }}
            </p>
            <div class="flex gap-3 justify-end">
              <button class="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer" @click="showNewConversationModal = false">{{ t('aiConsultation.cancel') }}</button>
              <button class="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-primary to-brand-accent rounded-xl hover:shadow-lg hover:shadow-brand-primary/25 transition-all cursor-pointer" @click="handleNewConversationFromModal">{{ t('aiConsultation.startNew') }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <PublicToastContainer />
  </div>
</template>
