<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { resolveTranslatedValue } from '@/utils/locale'
import axiosClient from '@/axiosClient'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const selectedId = ref(null)
const error = ref('')

const workspaces = computed(() => authStore.staffMemberships || [])

const userInitials = computed(() => authStore.user?.initials || '?')
const userName = computed(() => resolveTranslatedValue(authStore.user?.name) || '')
const userEmail = computed(() => authStore.user?.email || '')

async function selectWorkspace(workspace) {
  const facilityId = workspace.facility?.uuid || workspace.facility?.id
  if (!facilityId) return

  selectedId.value = workspace.facility?.id
  loading.value = true
  error.value = ''

  try {
    await axiosClient.post(`/set-active-workspace/${facilityId}`)
    authStore.setActiveWorkspace(workspace.facility?.id)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || t('workspace.selectFailed') || 'Failed to select workspace'
    selectedId.value = null
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
    <div class="w-full max-w-lg">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75 .75v3.15c0 .415.336.75.75.75z" />
          </svg>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">
          {{ t('workspace.selectTitle') || 'Select Workspace' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {{ t('workspace.selectDescription') || 'Choose a facility to continue.' }}
        </p>
      </div>

      <!-- User Info -->
      <div v-if="userName" class="flex items-center gap-3 mb-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div class="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
          {{ userInitials }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ userName }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ userEmail }}</p>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
      </div>

      <!-- Workspace List -->
      <div class="space-y-3">
        <button
          v-for="ws in workspaces"
          :key="ws.facility?.id || ws.facility?.uuid"
          class="w-full flex items-center gap-4 p-4 rounded-xl border transition cursor-pointer text-left"
          :class="[
            selectedId === ws.facility?.id
              ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
          ]"
          :disabled="loading"
          @click="selectWorkspace(ws)"
        >
          <!-- Icon -->
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            :class="selectedId === ws.facility?.id
              ? 'bg-brand-primary text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
            </svg>
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900 dark:text-white truncate">
              {{ resolveTranslatedValue(ws.facility?.name) }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ resolveTranslatedValue(ws.role?.name) }}
            </p>
          </div>

          <!-- Loading spinner -->
          <div v-if="selectedId === ws.facility?.id && loading" class="shrink-0">
            <svg class="w-5 h-5 text-brand-primary animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="workspaces.length === 0 && !loading" class="text-center py-12">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ t('workspace.noWorkspaces') || 'No workspaces available.' }}
        </p>
      </div>

      <!-- Logout -->
      <div class="mt-6 text-center">
        <button
          class="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
          @click="authStore.logout(); router.push('/login')"
        >
          {{ t('nav.logout') || 'Logout' }}
        </button>
      </div>
    </div>
  </div>
</template>
