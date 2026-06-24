<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { resolveTranslatedValue } from '@/utils/locale'

defineProps({
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['toggleMobile'])
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const authUser = computed(() => authStore.user || { name: 'Facility Owner', email: 'admin@facility.com' })
const userName = computed(() => resolveTranslatedValue(authUser.value.name))
const userInitials = computed(() => {
  const name = userName.value || 'FO'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const pageTitle = computed(() => {
  if (!route.name) return 'Dashboard'
  const name = String(route.name)
  return name
    .replace('facility-owner-', '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
})

const unreadCount = computed(() => 3)
</script>

<template>
  <header
    v-if="loading"
    class="h-[64px] bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 w-full"
  >
    <div class="flex items-center gap-3">
      <div class="w-6 h-6 skeleton-shimmer rounded lg:hidden"></div>
      <div class="w-32 h-5 skeleton-shimmer rounded-lg"></div>
    </div>
    <div class="flex items-center gap-4 lg:gap-5">
      <div class="w-9 h-9 skeleton-shimmer rounded-full"></div>
      <div class="hidden sm:flex items-center gap-2">
        <div class="w-9 h-9 skeleton-shimmer rounded-full"></div>
        <div class="w-24 h-4 skeleton-shimmer rounded-lg"></div>
      </div>
    </div>
  </header>

  <header
    v-else
    class="h-[64px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 w-full shadow-sm"
  >
    <div class="flex items-center gap-3">
      <button
        class="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition"
        @click="$emit('toggleMobile')"
      >
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
        </svg>
      </button>
      <span class="text-base lg:text-lg font-semibold text-slate-800 dark:text-slate-200 tracking-tight">{{ pageTitle }}</span>
    </div>

    <div class="flex items-center gap-2 lg:gap-3">
      <button class="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition" title="Notifications">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-[18px] h-[18px]">
          <path stroke-linecap="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
        </svg>
        <span
          v-if="unreadCount > 0"
          class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-danger rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-bold text-white leading-none"
        >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      </button>

      <div class="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 pr-2.5 rounded-xl transition">
        <div class="w-7 h-7 bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white font-bold rounded-full flex items-center justify-center text-[11px] shadow-sm shrink-0">
          {{ userInitials }}
        </div>
        <div class="hidden sm:flex flex-col text-left">
          <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none mb-0.5">{{ userName }}</span>
          <span class="text-[10px] text-slate-400 dark:text-slate-500 leading-none">{{ authUser.email }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
