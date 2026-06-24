<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import { resolveTranslatedValue } from '@/utils/locale'

defineProps({
  mobileOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const allLinks = [
  { label: 'Dashboard', icon: 'dashboard', to: '/facility/dashboard', permission: null },
  { label: 'Appointments', icon: 'calendar_month', to: '/facility-owner/appointments', permission: 'appointments.view' },
  { label: 'Doctors', icon: 'medical_information', to: '/facility-owner/doctors', permission: 'doctors.view' },
  { label: 'Patients', icon: 'group', to: '/facility-owner/patients', permission: 'patients.view' },
  { label: 'Schedule', icon: 'event_available', to: '/facility-owner/schedule', permission: 'schedule.view' },
  { label: 'Analytics', icon: 'analytics', to: '/facility-owner/analytics', permission: 'analytics.view' },
  { label: 'Alerts', icon: 'notifications_active', to: '/facility-owner/alerts', permission: 'alerts.view' },
  { label: 'Messages', icon: 'chat', to: '/facility-owner/messages', permission: 'messages.view' },
  { label: 'Settings', icon: 'settings', to: '/facility-owner/settings', permission: 'settings.view' }
]

const links = computed(() => {
  if (authStore.isSuperAdmin()) return allLinks
  return allLinks.filter(link => !link.permission || authStore.can(link.permission))
})

const userName = computed(() => resolveTranslatedValue(authStore.user?.name) || 'Facility Owner')
const userEmail = computed(() => authStore.user?.email || 'admin@facility.com')

function navigate(to) {
  router.push(to)
  emit('close')
}

function isActive(to) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-slate-900/30 lg:hidden" @click="$emit('close')"></div>
  <aside
    class="fixed inset-y-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900"
    :class="[
      $i18n.locale === 'ar' ? 'right-0 border-l border-r-0 lg:translate-x-0' : 'left-0 lg:translate-x-0',
      mobileOpen ? 'translate-x-0' : ($i18n.locale === 'ar' ? 'translate-x-full' : '-translate-x-full')
    ]"
  >
    <div class="flex h-[70px] items-center gap-3 border-b border-slate-100 px-5 dark:border-slate-800">
      <div class="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
        H
      </div>
      <div class="min-w-0">
        <p class="text-sm font-bold text-slate-900 dark:text-white truncate">Facility Dashboard</p>
        <p class="text-[10px] font-semibold text-brand-primary uppercase tracking-wider">Facility Owner</p>
      </div>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <button
        v-for="link in links"
        :key="link.to"
        class="flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm font-semibold transition"
        :class="isActive(link.to)
          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20'
          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'"
        @click="navigate(link.to)"
      >
        <span class="material-symbols-outlined text-[20px]">{{ link.icon }}</span>
        {{ link.label }}
      </button>
    </nav>

    <div class="border-t border-slate-100 p-4 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <AvatarInitial :name="userName" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-slate-900 truncate dark:text-white">{{ userName }}</p>
          <p class="text-xs text-slate-500 truncate dark:text-slate-400">{{ userEmail }}</p>
        </div>
      </div>
      <button class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700" @click="router.push('/')">
        <span class="material-symbols-outlined text-[18px]">logout</span>
        Logout
      </button>
    </div>
  </aside>
</template>
