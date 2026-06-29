<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAiChatStore } from '@/stores/aiChat'

const { t } = useI18n()
const store = useAiChatStore()

const input = ref('')
const messagesContainer = ref(null)
const textareaRef = ref(null)

const suggestedPrompts = [
  { label: 'Summarize dashboard', icon: 'dashboard' },
  { label: 'Analyze donations', icon: 'finance' },
  { label: 'Show facility issues', icon: 'warning' },
  { label: 'Latest patient trends', icon: 'trending_up' },
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

function usePrompt(prompt) {
  input.value = prompt
  textareaRef.value?.focus()
}

onMounted(() => {
  textareaRef.value?.focus()
})
</script>

<template>
  <div class="flex h-[calc(100vh-10rem)] flex-col rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 shrink-0">
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
          <span class="material-symbols-outlined text-[22px]">smart_toy</span>
        </span>
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">AI Assistant</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ store.assistantLabel }} · {{ store.role === 'super_admin' ? 'Global' : 'Facility' }} scope</p>
        </div>
      </div>
      <button
        v-if="store.messages.length > 0"
        class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        @click="store.clearMessages()"
      >
        <span class="material-symbols-outlined text-[16px]">delete</span>
        Clear
      </button>
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
        <h3 class="text-base font-bold text-slate-700 dark:text-slate-300">How can I help you today?</h3>
        <p class="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Ask me about your dashboard statistics, donations, facility operations, or anything related to HES Connect.
        </p>
      </div>

      <template v-for="(msg, idx) in store.messages" :key="idx">
        <div class="flex gap-3" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
          <!-- Avatar -->
          <span
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            :class="msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
          >
            <span class="material-symbols-outlined text-[18px]">
              {{ msg.role === 'user' ? 'person' : 'smart_toy' }}
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
                  : 'bg-slate-100 dark:bg-slate-700/70 text-slate-800 dark:text-slate-200 rounded-tl-md'
              "
            >
              {{ msg.content }}
            </div>
            <p
              class="text-[10px] text-slate-400 dark:text-slate-500 px-1"
              :class="msg.role === 'user' ? 'text-right' : ''"
            >
              {{ msg.role === 'user' ? 'You' : 'AI' }}
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
          :key="prompt.label"
          class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary"
          @click="usePrompt(prompt.label)"
        >
          <span class="material-symbols-outlined text-[15px]">{{ prompt.icon }}</span>
          {{ prompt.label }}
        </button>
      </div>
    </div>

    <!-- Input -->
    <div class="shrink-0 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
      <div class="flex items-end gap-3">
        <textarea
          ref="textareaRef"
          v-model="input"
          :placeholder="t('common.typeMessage', 'Type your message...')"
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
          <span class="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
      <p class="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 text-center">Press Enter to send · Shift+Enter for new line</p>
    </div>
  </div>
</template>
