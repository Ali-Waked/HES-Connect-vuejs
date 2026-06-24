<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { useStaffStore } from '@/stores/useStaffStore'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import HesLogo from '@/components/global/HesLogo.vue'
import { resolveTranslatedValue } from '@/utils/locale'

defineProps({
  mobileOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const staffStore = useStaffStore()
const { t } = useI18n()
const { can } = useAuthPermissions()

const MENU_DEFINITIONS = [
  { key: 'dashboard', icon: 'dashboard', permission: null, to: '/dashboard' },
  { key: 'appointments', icon: 'calendar_month', permission: 'appointments.view', to: '/dashboard/appointments' },
  { key: 'patients', icon: 'group', permission: 'patients.view', to: '/dashboard/patients' },
  { key: 'prescriptions', icon: 'medication', permission: 'prescriptions.view', to: '/dashboard/prescriptions' },
  { key: 'schedule', icon: 'event_available', permission: 'schedule.view', to: '/dashboard/schedule' },
  { key: 'reviews', icon: 'star', permission: 'reviews.view', to: '/dashboard/reviews' },
  { key: 'staff', icon: 'badge', permission: 'staff.view', to: '/dashboard/staff' },
  { key: 'departments', icon: 'domain', permission: 'departments.view', to: '/dashboard/departments' },
  { key: 'inventory', icon: 'inventory_2', permission: 'inventory.view', to: '/dashboard/inventory' },
  { key: 'medicationRequests', icon: 'inbox', permission: 'medication_requests.view', to: '/dashboard/medication-requests' },
  { key: 'medicines', icon: 'medication', permission: 'medicines.view', to: '/dashboard/medicines' },
  { key: 'articles', icon: 'article', permission: 'articles.view', to: '/dashboard/articles' },
  { key: 'documents', icon: 'description', permission: 'documents.view', to: '/dashboard/documents' },
  { key: 'jobPosts', icon: 'work', permission: 'job_posts.view', to: '/dashboard/job-posts' },
  { key: 'reports', icon: 'assessment', permission: 'reports.view', to: '/dashboard/reports' },
  { key: 'messages', icon: 'mail', permission: 'messages.view', to: '/dashboard/messages' },
  { key: 'notifications', icon: 'notifications', permission: null, to: '/dashboard/notifications' },
  { key: 'profile', icon: 'person', permission: null, to: '/dashboard/profile' },
]

const MENU_LABELS = {
  dashboard: () => t('staffSidebar.dashboard'),
  appointments: () => t('staffSidebar.appointments'),
  patients: () => t('staffSidebar.myPatients'),
  prescriptions: () => t('staffSidebar.prescriptions'),
  schedule: () => t('staffSidebar.mySchedule'),
  reviews: () => t('staffSidebar.reviews'),
  staff: () => t('staffSidebar.staff'),
  departments: () => t('staffSidebar.departments'),
  inventory: () => t('staffSidebar.inventory'),
  medicationRequests: () => t('staffSidebar.medicationRequests'),
  medicines: () => 'Medicines',
  articles: () => 'Articles',
  documents: () => 'Documents',
  jobPosts: () => 'Job Posts',
  reports: () => 'Reports',
  messages: () => 'Messages',
  notifications: () => 'Notifications',
  profile: () => t('staffSidebar.myProfile'),
}

const visibleItems = computed(() => {
  if (authStore.isSuperAdmin()) {
    return MENU_DEFINITIONS.map(item => ({
      ...item,
      label: MENU_LABELS[item.key]?.() || item.key,
    }))
  }
  return MENU_DEFINITIONS
    .filter(item => !item.permission || can(item.permission))
    .map(item => ({
      ...item,
      label: MENU_LABELS[item.key]?.() || item.key,
    }))
})

function navigate(to) {
  router.push(to)
  emit('close')
}
</script>

<template>
  <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-slate-900/30 dark:bg-slate-900/60 lg:hidden" @click="$emit('close')" />
  <aside
    class="fixed inset-y-0 z-50 flex w-[260px] flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-transform duration-300"
    :class="[
      $i18n.locale === 'ar' ? 'right-0 border-l border-r-0 lg:translate-x-0' : 'left-0 lg:translate-x-0',
      mobileOpen ? 'translate-x-0' : ($i18n.locale === 'ar' ? 'translate-x-full' : '-translate-x-full')
    ]"
  >
    <div class="flex h-[70px] items-center border-b border-slate-100 dark:border-slate-700 px-5">
      <HesLogo variant="full" :height="32" theme="light" />
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <button
        v-for="item in visibleItems"
        :key="item.to"
        class="flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm font-semibold transition"
        :class="route.path === item.to ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'"
        @click="navigate(item.to)"
      >
        <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
        {{ item.label }}
      </button>
    </nav>

    <div class="border-t border-slate-100 dark:border-slate-700 p-4">
      <div class="flex items-center gap-3">
        <AvatarInitial :name="resolveTranslatedValue(staffStore.currentUser.name)" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ resolveTranslatedValue(staffStore.currentUser.name) }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
            {{ resolveTranslatedValue(workspaceStore.currentRole?.name) || 'Staff' }}
            <span v-if="workspaceStore.currentFacility"> · {{ resolveTranslatedValue(workspaceStore.currentFacility.name) }}</span>
          </p>
        </div>
      </div>
      <button class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-600" @click="router.push('/')">
        <span class="material-symbols-outlined text-[18px]">logout</span>
        {{ t('staffSidebar.logout') }}
      </button>
    </div>
  </aside>
</template>
