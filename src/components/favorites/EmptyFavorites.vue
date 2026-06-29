<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div class="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-5">
      <svg class="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </div>
    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ t('favorites.emptyTitle') }}</h3>
    <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{{ t('favorites.emptyDescription') }}</p>
    <button
      class="btn-primary"
      @click="router.push('/articles')"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      {{ t('favorites.emptyCta') }}
    </button>
  </div>
</template>
