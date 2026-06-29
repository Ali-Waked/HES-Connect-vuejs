<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { updateTypes } from '@/services/subscriptionService'
import { usePublicToast } from '@/composables/usePublicToast'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const { t } = useI18n()
const route = useRoute()
const { addToast } = usePublicToast()

const token = route.params.token
const selectedTypes = ref([])
const allTypes = ['article', 'story', 'job', 'event', 'newsletter']
const loading = ref(true)
const saving = ref(false)

onMounted(() => {
  selectedTypes.value = [...allTypes]
  loading.value = false
})

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

async function handleSave() {
  saving.value = true
  try {
    await updateTypes(token, selectedTypes.value)
    addToast(t('subscription.updateSuccess'), 'success')
  } catch (err) {
    addToast(err.response?.data?.message || t('subscription.updateError'), 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />
    <main class="max-w-lg mx-auto px-4 pt-32 pb-20">
      <div v-if="loading" class="text-center py-20">
        <div class="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
      </div>

      <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
        <div class="w-14 h-14 bg-brand-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5">
          <svg class="w-7 h-7 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h1 class="text-2xl font-black text-slate-900 dark:text-white text-center mb-2">{{ t('subscription.manageTitle') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">{{ t('subscription.manageDesc') }}</p>

        <div class="space-y-2 mb-8">
          <button
            v-for="type in allTypes"
            :key="type"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer"
            :class="selectedTypes.includes(type)
              ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'"
            @click="toggleType(type)"
          >
            <div class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
              :class="selectedTypes.includes(type)
                ? 'border-brand-primary bg-brand-primary'
                : 'border-slate-300 dark:border-slate-600'"
            >
              <svg v-if="selectedTypes.includes(type)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            {{ t(`subscription.typeLabels.${type}s`) }}
          </button>
        </div>

        <button
          @click="handleSave"
          :disabled="saving"
          class="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          {{ saving ? t('subscription.saving') : t('subscription.saveChanges') }}
        </button>
      </div>
    </main>
    <LandingFooter />
  </div>
</template>
