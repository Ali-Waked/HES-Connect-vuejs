<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAiChatStore } from '@/stores/aiChat'

const { t } = useI18n()
const store = useAiChatStore()

const input = ref('')
const messagesContainer = ref(null)
const textareaRef = ref(null)
const showSidebar = ref(true)
const renameModal = ref(false)
const renameValue = ref('')
const renamingUuid = ref(null)
const expandedTools = ref(new Set())

function toggleTool(idx) {
  if (expandedTools.value.has(idx)) {
    expandedTools.value.delete(idx)
  } else {
    expandedTools.value.add(idx)
  }
}

function formatToolContent(content) {
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return `${parsed.length} records`
    return content
  } catch {
    return content
  }
}

const suggestedPrompts = [
  { labelKey: 'aiChat.promptSummarize', icon: 'dashboard' },
  { labelKey: 'aiChat.promptAnalyze', icon: 'finance' },
  { labelKey: 'aiChat.promptIssues', icon: 'warning' },
  { labelKey: 'aiChat.promptTrends', icon: 'trending_up' },
]

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => store.messages.length, scrollToBottom)
watch(() => store.loading, scrollToBottom)

function send() {
  const text = input.value.trim()
  if (!text || store.loading) return
  input.value = ''
  store.sendMessage(text)
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function usePrompt(promptKey) {
  input.value = t(promptKey)
  textareaRef.value?.focus()
}

function selectConversation(uuid) {
  store.loadConversation(uuid)
}

function openRename(conv) {
  renamingUuid.value = conv.uuid
  renameValue.value = conv.title
  renameModal.value = true
}

async function confirmRename() {
  if (!renameValue.value.trim()) return
  await store.renameConv(renamingUuid.value, renameValue.value.trim())
  renameModal.value = false
  renamingUuid.value = null
}

async function confirmDelete(uuid) {
  if (!confirm(t('aiChat.deleteConfirm'))) return
  await store.deleteConv(uuid)
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return t('aiChat.today')
  if (diffDays === 1) return t('aiChat.yesterday')
  return d.toLocaleDateString()
}

onMounted(() => {
  store.fetchConversations()
  textareaRef.value?.focus()
})
</script>

<template>
  <div class="flex h-[calc(100vh-10rem)] rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
    <!-- Sidebar -->
    <div
      v-show="showSidebar"
      class="w-72 shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-900/50"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ t('aiChat.conversations') }}</h3>
        <button
          class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          @click="store.startNewConversation()"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto py-2 space-y-0.5">
        <div v-if="store.loadingConversations" class="flex justify-center py-8">
          <span class="material-symbols-outlined text-[20px] text-slate-400 animate-spin">progress_activity</span>
        </div>
        <button
          v-for="conv in store.conversations"
          :key="conv.uuid"
          class="w-full text-left px-4 py-2.5 group transition"
          :class="store.activeConversation?.uuid === conv.uuid
            ? 'bg-brand-primary/10 text-brand-primary'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="selectConversation(conv.uuid)"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                :class="store.activeConversation?.uuid === conv.uuid
                  ? 'bg-brand-primary/20 text-brand-primary'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
              >
                <span class="material-symbols-outlined text-[15px]">chat_bubble</span>
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium truncate">{{ conv.title }}</p>
                <p class="text-[10px] mt-0.5 opacity-60">{{ formatDate(conv.last_message_at) }}</p>
              </div>
            </div>
            <div class="hidden group-hover:flex items-center gap-1 shrink-0">
              <button
                class="h-5 w-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                @click.stop="openRename(conv)"
              >
                <span class="material-symbols-outlined text-[14px]">edit</span>
              </button>
              <button
                class="h-5 w-5 flex items-center justify-center rounded text-slate-400 hover:text-red-500"
                @click.stop="confirmDelete(conv.uuid)"
              >
                <span class="material-symbols-outlined text-[14px]">delete</span>
              </button>
            </div>
          </div>
        </button>
        <p v-if="!store.loadingConversations && store.conversations.length === 0" class="text-center text-xs text-slate-400 py-8">
          {{ t('aiChat.noConversations') }}
        </p>
      </div>
    </div>

    <!-- Main chat area -->
    <div class="flex flex-col flex-1 min-w-0">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 shrink-0">
        <div class="flex items-center gap-3">
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition lg:hidden"
            @click="showSidebar = !showSidebar"
          >
            <span class="material-symbols-outlined text-[18px]">menu</span>
          </button>
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <span class="material-symbols-outlined text-[22px]">smart_toy</span>
          </span>
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('aiChat.title') }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ store.assistantLabel }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="store.messages.length > 0"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            @click="store.startNewConversation()"
          >
            <span class="material-symbols-outlined text-[16px]">add</span>
            {{ t('aiChat.newChat') }}
          </button>
          <button
            class="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            @click="showSidebar = !showSidebar"
          >
            <span class="material-symbols-outlined text-[18px]">view_sidebar</span>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto px-6 py-5 space-y-4 scroll-smooth"
      >
        <div v-if="store.messages.length === 0" class="flex h-full flex-col items-center justify-center text-center">
          <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/5 text-brand-primary">
            <span class="material-symbols-outlined text-[32px]">psychology</span>
          </span>
          <h3 class="text-base font-bold text-slate-700 dark:text-slate-300">{{ t('aiChat.emptyState') }}</h3>
          <p class="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {{ t('aiChat.emptyDesc') }}
          </p>
        </div>

        <template v-for="(msg, idx) in store.messages" :key="idx">
          <div class="flex gap-3" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
            <!-- Avatar -->
            <span
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              :class="msg.role === 'user'
                ? 'bg-brand-primary text-white'
                : msg.role === 'tool'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
            >
              <span class="material-symbols-outlined text-[18px]">
                {{ msg.role === 'user' ? 'person' : msg.role === 'tool' ? 'build' : 'smart_toy' }}
              </span>
            </span>

            <!-- Bubble -->
            <div class="max-w-[75%] space-y-1">
              <div
                class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                :class="msg.role === 'user'
                  ? 'bg-brand-primary text-white rounded-tr-md'
                  : msg.isError
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-tl-md'
                    : msg.role === 'tool'
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-tl-md'
                      : 'bg-slate-100 dark:bg-slate-700/70 text-slate-800 dark:text-slate-200 rounded-tl-md'"
              >
                <template v-if="msg.role === 'tool'">
                  <button
                    class="flex items-center gap-2 text-xs font-semibold w-full"
                    @click="toggleTool(idx)"
                  >
                    <span class="material-symbols-outlined text-[14px]">build</span>
                    <span class="uppercase tracking-wider opacity-70">{{ t('aiChat.toolPrefix') }}</span>
                    <span class="font-mono">{{ msg.toolName }}</span>
                    <span class="material-symbols-outlined text-[14px] ml-auto transition-transform" :class="expandedTools.has(idx) ? 'rotate-180' : ''">expand_more</span>
                  </button>
                  <p v-if="!expandedTools.has(idx)" class="text-xs mt-1 opacity-70 font-mono">
                    {{ formatToolContent(msg.content) }}
                  </p>
                  <div v-else class="mt-2 max-h-60 overflow-y-auto">
                    <pre class="text-[11px] font-mono whitespace-pre-wrap break-all">{{ msg.content }}</pre>
                  </div>
                </template>
                <template v-else>
                  {{ msg.content }}
                </template>
              </div>
              <p
                class="text-[10px] text-slate-400 dark:text-slate-500 px-1"
                :class="msg.role === 'user' ? 'text-right' : ''"
              >
                {{ msg.role === 'user' ? t('aiChat.you') : msg.role === 'tool' ? t('aiChat.tool') : t('aiChat.ai') }} · {{ formatTime(msg.timestamp) }}
              </p>
            </div>
          </div>
        </template>

        <!-- Loading indicator -->
        <div v-if="store.loading" class="flex gap-3">
          <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            <span class="material-symbols-outlined text-[18px]">smart_toy</span>
          </span>
          <div class="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-slate-100 dark:bg-slate-700/70 px-4 py-3">
            <span class="h-2 w-2 animate-bounce rounded-full bg-brand-primary" style="animation-delay:0ms" />
            <span class="h-2 w-2 animate-bounce rounded-full bg-brand-primary" style="animation-delay:150ms" />
            <span class="h-2 w-2 animate-bounce rounded-full bg-brand-primary" style="animation-delay:300ms" />
          </div>
        </div>
      </div>

      <!-- Suggested prompts -->
      <div v-if="store.messages.length === 0" class="shrink-0 px-6 pb-3">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="prompt in suggestedPrompts"
            :key="prompt.labelKey"
            class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary"
            @click="usePrompt(prompt.labelKey)"
          >
            <span class="material-symbols-outlined text-[15px]">{{ prompt.icon }}</span>
            {{ t(prompt.labelKey) }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="shrink-0 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
        <div class="flex items-end gap-3">
          <textarea
            ref="textareaRef"
            v-model="input"
            :placeholder="t('aiChat.typeMessage')"
            class="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30"
            rows="1"
            :disabled="store.loading"
            @keydown="onKeydown"
          />
          <button
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white transition hover:bg-brand-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!input.trim() || store.loading"
            @click="send"
          >
            <span class="material-symbols-outlined text-[20px] rtl:rotate-180">send</span>
          </button>
        </div>
        <p class="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 text-center">{{ t('aiChat.sendHint') }}</p>
      </div>
    </div>

    <!-- Rename modal -->
    <Teleport to="body">
      <div v-if="renameModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="renameModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4">{{ t('aiChat.renameTitle') }}</h3>
          <input
            v-model="renameValue"
            maxlength="60"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-primary"
            :placeholder="t('aiChat.renamePlaceholder')"
            @keydown.enter="confirmRename"
          />
          <div class="flex justify-end gap-2 mt-4">
            <button
              class="px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              @click="renameModal = false"
            >
              {{ t('aiChat.cancel') }}
            </button>
            <button
              class="px-3 py-1.5 text-sm font-semibold text-white bg-brand-primary rounded-lg transition hover:bg-brand-primary-dark disabled:opacity-50"
              :disabled="!renameValue.trim()"
              @click="confirmRename"
            >
              {{ t('aiChat.save') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
