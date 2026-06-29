<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { unsubscribe } from '@/services/subscriptionService'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const { t } = useI18n()
const route = useRoute()

const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    await unsubscribe(route.params.token)
    success.value = true
  } catch (err) {
    success.value = false
    errorMessage.value = err.response?.data?.message || t('subscription.unsubscribeError')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />
    <main class="max-w-lg mx-auto px-4 pt-32 pb-20">
      <div v-if="loading" class="text-center py-20">
        <div class="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ t('subscription.processing') }}</p>
      </div>

      <div v-else-if="success" class="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg class="w-8 h-8 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white mb-2">{{ t('subscription.unsubscribeSuccessTitle') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">{{ t('subscription.unsubscribeSuccessDesc') }}</p>
        <router-link to="/" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-xl transition">
          {{ t('subscription.backToHome') }}
        </router-link>
      </div>

      <div v-else class="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg class="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white mb-2">{{ t('subscription.unsubscribeFailTitle') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">{{ errorMessage }}</p>
        <router-link to="/" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-xl transition">
          {{ t('subscription.backToHome') }}
        </router-link>
      </div>
    </main>
    <LandingFooter />
  </div>
</template>
