<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePatientAiStore } from '@/stores/patientAi'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const { t } = useI18n()
const router = useRouter()
const store = usePatientAiStore()

const input = ref('')
const messagesContainer = ref(null)
const textareaRef = ref(null)

const suggestedPrompts = [
  'I have chest pain',
  'I feel dizzy',
  'I have fever',
  'I have skin rash',
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

function bookAppointment(doctor) {
  const uuid = doctor.uuid || doctor.id
  window.open(`/doctors/${uuid}`, '_blank')
}

function askFollowUp(question) {
  input.value = question
  nextTick(() => send())
}

const urgencyColors = {
  low: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', label: 'Low' },
  medium: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', label: 'Medium' },
  high: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500', label: 'High' },
}

onMounted(() => {
  textareaRef.value?.focus()
})
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-8">
      <!-- Page header -->
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Medical Consultation</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Describe your symptoms and get instant guidance</p>
      </div>

      <!-- Chat container -->
      <div class="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden" style="min-height: 600px">
        <!-- Messages -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 scroll-smooth" style="max-height: 480px">
          <!-- Empty state -->
          <div v-if="store.messages.length === 0" class="flex h-full flex-col items-center justify-center text-center py-12">
            <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/5 text-brand-primary">
              <span class="material-symbols-outlined text-[32px]">stethoscope</span>
            </span>
            <h3 class="text-base font-bold text-slate-700 dark:text-slate-300">How are you feeling today?</h3>
            <p class="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Describe your symptoms in natural language. The AI will analyze your condition and recommend the right doctor.
            </p>
            <p class="mt-4 text-xs text-amber-600 dark:text-amber-400 font-medium">
              This is not a substitute for professional medical advice.
            </p>
          </div>

          <template v-for="(msg, idx) in store.messages" :key="idx">
            <div class="flex gap-3" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
              <!-- Avatar -->
              <span
                class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                :class="msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
              >
                <span class="material-symbols-outlined text-[18px]">{{ msg.role === 'user' ? 'person' : 'stethoscope' }}</span>
              </span>

              <!-- Bubble -->
              <div class="max-w-[80%] sm:max-w-[70%] space-y-2">
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

                <!-- Follow-up question chips (inside AI bubble area) -->
                <div v-if="msg.role === 'assistant' && msg.followUpQuestions?.length > 0 && !msg.isError" class="flex flex-wrap gap-1.5">
                  <button
                    v-for="q in msg.followUpQuestions"
                    :key="q"
                    class="rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition hover:border-brand-primary/40 hover:text-brand-primary whitespace-nowrap"
                    @click="askFollowUp(q)"
                  >
                    {{ q }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Recommendation panel (after latest AI response) -->
            <div v-if="msg.role === 'assistant' && !msg.isError && store.recommendations && idx === store.messages.length - 1" class="ml-11 space-y-4">
              <!-- Condition + Urgency row -->
              <div class="flex flex-wrap items-center gap-3">
                <div v-if="store.recommendations.condition" class="rounded-lg bg-slate-100 dark:bg-slate-700/50 px-3.5 py-2">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Possible Condition</p>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ store.recommendations.condition }}</p>
                </div>
                <div
                  v-if="store.recommendations.urgency"
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                  :class="urgencyColors[store.recommendations.urgency]?.bg || 'bg-slate-100 dark:bg-slate-700'"
                >
                  <span class="h-2 w-2 rounded-full" :class="urgencyColors[store.recommendations.urgency]?.dot || 'bg-slate-400'" />
                  <span :class="urgencyColors[store.recommendations.urgency]?.text || 'text-slate-600 dark:text-slate-400'">
                    {{ urgencyColors[store.recommendations.urgency]?.label || store.recommendations.urgency }} Urgency
                  </span>
                </div>
              </div>

              <!-- Doctor cards -->
              <div v-if="store.recommendations.doctors?.length > 0">
                <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recommended Doctors</p>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div
                    v-for="doc in store.recommendations.doctors"
                    :key="doc.uuid || doc.id"
                    class="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 p-3 transition hover:shadow-sm"
                  >
                    <img
                      v-if="doc.avatar || doc.profile_image || doc.image"
                      :src="doc.avatar || doc.profile_image || doc.image"
                      :alt="doc.name"
                      class="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                    <div v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">
                      {{ (doc.name || 'Dr.').charAt(0) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ doc.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ doc.specialization || doc.specialty || 'General' }}</p>
                      <p v-if="doc.fee != null" class="text-xs font-semibold text-brand-primary mt-0.5">${{ doc.fee }} consultation</p>
                    </div>
                    <button
                      class="shrink-0 rounded-lg bg-brand-primary px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-brand-primary-dark"
                      @click="bookAppointment(doc)"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Loading indicator -->
          <div v-if="store.loading" class="flex gap-3">
            <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-[18px]">stethoscope</span>
            </span>
            <div class="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-slate-100 dark:bg-slate-700/70 px-4 py-3">
              <span class="h-2 w-2 animate-bounce rounded-full bg-brand-primary" style="animation-delay:0ms" />
              <span class="h-2 w-2 animate-bounce rounded-full bg-brand-primary" style="animation-delay:150ms" />
              <span class="h-2 w-2 animate-bounce rounded-full bg-brand-primary" style="animation-delay:300ms" />
            </div>
          </div>
        </div>

        <!-- Suggested prompts (shown when no messages) -->
        <div v-if="store.messages.length === 0" class="shrink-0 border-t border-slate-100 dark:border-slate-700 px-4 sm:px-6 py-3">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="prompt in suggestedPrompts"
              :key="prompt"
              class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary"
              @click="usePrompt(prompt)"
            >
              <span class="material-symbols-outlined text-[15px]">stethoscope</span>
              {{ prompt }}
            </button>
          </div>
        </div>

        <!-- Input -->
        <div class="shrink-0 border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4">
          <div class="flex items-end gap-3">
            <textarea
              ref="textareaRef"
              v-model="input"
              placeholder="Describe your symptoms..."
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

      <!-- Clear button -->
      <div v-if="store.messages.length > 0" class="mt-4 text-center">
        <button
          class="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
          @click="store.clearChat()"
        >
          Clear conversation
        </button>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
