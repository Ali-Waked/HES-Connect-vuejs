<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { subscribe } from '@/services/subscriptionService'
import { usePublicToast } from '@/composables/usePublicToast'

const { t } = useI18n()
const { addToast } = usePublicToast()

const email = ref('')
const selectedTypes = ref(['article'])
const loading = ref(false)
const errors = ref({})

const typeOptions = [
  { value: 'article', label: 'articles', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
  { value: 'story', label: 'stories', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { value: 'job', label: 'jobs', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { value: 'event', label: 'events', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
  { value: 'newsletter', label: 'newsletter', icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75' },
]

function toggleType(type) {
  const idx = selectedTypes.value.indexOf(type)
  if (idx >= 0) {
    if (selectedTypes.value.length > 1) {
      selectedTypes.value.splice(idx, 1)
    }
  } else {
    selectedTypes.value.push(type)
  }
}

async function handleSubmit() {
  errors.value = {}
  if (!email.value) {
    errors.value.email = t('validation.required')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = t('validation.email')
    return
  }
  if (selectedTypes.value.length === 0) {
    errors.value.types = t('subscription.selectAtLeastOne')
    return
  }

  loading.value = true
  try {
    const locale = localStorage.getItem('lang') || 'en'
    await subscribe({ email: email.value, locale, types: selectedTypes.value })
    addToast(t('subscription.subscribeSuccess'), 'success')
    email.value = ''
    selectedTypes.value = ['article']
  } catch (err) {
    addToast(err.response?.data?.message || t('subscription.subscribeError'), 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div>
      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{{ t('subscription.emailLabel') }}</label>
      <div class="relative">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        <input
          v-model="email"
          type="email"
          :placeholder="t('subscription.emailPlaceholder')"
          class="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
          :class="errors.email ? 'border-red-400 focus:ring-red-200' : ''"
        />
      </div>
      <p v-if="errors.email" class="mt-1.5 text-xs text-red-500">{{ errors.email }}</p>
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{{ t('subscription.typesLabel') }}</label>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          type="button"
          class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer"
          :class="selectedTypes.includes(opt.value)
            ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary dark:bg-brand-primary/20 dark:border-brand-primary/40'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'"
          @click="toggleType(opt.value)"
        >
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" :d="opt.icon" />
          </svg>
          {{ t(`subscription.typeLabels.${opt.label}`) }}
        </button>
      </div>
      <p v-if="errors.types" class="mt-1.5 text-xs text-red-500">{{ errors.types }}</p>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
    >
      <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {{ loading ? t('subscription.subscribing') : t('subscription.subscribeButton') }}
    </button>
  </form>
</template>
