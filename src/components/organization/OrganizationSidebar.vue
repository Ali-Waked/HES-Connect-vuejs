<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import { resolveTranslatedValue } from '@/utils/locale'

defineProps({
  mobileOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { can } = useAuthPermissions()

const allLinks = [
  { label: 'Dashboard', icon: 'dashboard', to: '/organization/dashboard', permission: null },
  { label: 'Facilities', icon: 'home_health', to: '/organization/facilities', permission: 'facilities.view' },
  { label: 'Departments', icon: 'lan', to: '/organization/departments', permission: 'departments.view' },
  { label: 'Staff', icon: 'badge', to: '/organization/staff', permission: 'staff.view' },
  { label: 'Appointments', icon: 'calendar_month', to: '/organization/appointments', permission: 'appointments.view' },
  { label: 'Patients', icon: 'group', to: '/organization/patients', permission: 'patients.view' },
  { label: 'Reviews', icon: 'star', to: '/organization/reviews', permission: 'reviews.view' },
  { label: 'Reports', icon: 'analytics', to: '/organization/reports', permission: 'reports.view' },
  { label: 'Analytics', icon: 'insights', to: '/organization/analytics', permission: 'analytics.view' },
  { label: 'Notifications', icon: 'notifications', to: '/organization/notifications', permission: 'notifications.view' },
  { label: 'Settings', icon: 'settings', to: '/organization/settings', permission: 'settings.view' }
]

const links = computed(() => {
  if (authStore.isSuperAdmin()) return allLinks
  return allLinks.filter(link => !link.permission || can(link.permission))
})

const userName = computed(() => resolveTranslatedValue(authStore.user?.name) || 'Organization Owner')
const userEmail = computed(() => authStore.user?.email || 'admin@organization.com')

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
    class="fixed inset-y-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-300"
    :class="[
      $i18n.locale === 'ar' ? 'right-0 border-l border-r-0 lg:translate-x-0' : 'left-0 lg:translate-x-0',
      mobileOpen ? 'translate-x-0' : ($i18n.locale === 'ar' ? 'translate-x-full' : '-translate-x-full')
    ]"
  >
    <div class="flex h-[70px] items-center gap-3 border-b border-slate-100 px-5">
      <div class="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white text-sm font-bold shrink-0">O</div>
      <div class="min-w-0">
        <p class="text-sm font-bold text-slate-900 truncate">Organization Dashboard</p>
        <p class="text-[10px] font-semibold text-brand-primary uppercase tracking-wider">Owner</p>
      </div>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <button
        v-for="link in links"
        :key="link.to"
        class="flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm font-semibold transition"
        :class="isActive(link.to)
          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        @click="navigate(link.to)"
      >
        <span class="material-symbols-outlined text-[20px]">{{ link.icon }}</span>
        {{ link.label }}
      </button>
    </nav>

    <div class="border-t border-slate-100 p-4">
      <div class="flex items-center gap-3">
        <AvatarInitial :name="userName" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-slate-900 truncate">{{ userName }}</p>
          <p class="text-xs text-slate-500 truncate">{{ userEmail }}</p>
        </div>
      </div>
      <button class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50" @click="router.push('/')">
        <span class="material-symbols-outlined text-[18px]">logout</span>
        Logout
      </button>
    </div>
  </aside>
</template>
