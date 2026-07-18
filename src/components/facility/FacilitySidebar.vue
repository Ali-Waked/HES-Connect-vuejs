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
  { key: 'appointments', icon: 'calendar_month', permission: 'view_appointments', to: '/dashboard/appointments' },
  { key: 'patients', icon: 'group', permission: 'view_patients', to: '/dashboard/patients' },
  { key: 'prescriptions', icon: 'medication', permission: 'view_prescriptions', to: '/dashboard/prescriptions' },
  { key: 'calendar', icon: 'calendar_view_week', permission: 'view_staff_schedules', to: '/dashboard/calendar' },
  { key: 'schedule', icon: 'event_available', permission: 'view_staff_schedules', to: '/dashboard/schedule' },
  { key: 'manageSchedules', icon: 'calendar_month', permission: 'view_staff_schedules', to: '/dashboard/manage-schedules' },
  { key: 'unavailability', icon: 'event_busy', permission: 'view_staff_schedules', to: '/dashboard/unavailability-management' },
  { key: 'reviews', icon: 'star', permission: 'view_reviews', to: '/dashboard/reviews' },
  { key: 'staff', icon: 'badge', permission: 'view_staff', to: '/dashboard/staff' },
  { key: 'departments', icon: 'domain', permission: 'view_departments', to: '/dashboard/departments' },
  { key: 'inventory', icon: 'inventory_2', permission: 'view_medicines', to: '/dashboard/inventory' },
  { key: 'medicationRequests', icon: 'inbox', permission: 'view_medication_requests', to: '/dashboard/medication-requests' },
  { key: 'medicines', icon: 'medication', permission: 'view_medicines', to: '/dashboard/medicines' },
  { key: 'articles', icon: 'article', permission: 'view_articles', to: '/dashboard/articles' },
  { key: 'aiChat', icon: 'smart_toy', permission: null, to: '/dashboard/ai-chat' },
  { key: 'jobPosts', icon: 'work', permission: 'view_reports', to: '/dashboard/job-posts' },
  { key: 'reports', icon: 'assessment', permission: 'view_reports', to: '/dashboard/reports' },
  { key: 'messages', icon: 'mail', permission: 'view_notifications', to: '/dashboard/messages' },
  { key: 'notifications', icon: 'notifications', permission: null, to: '/dashboard/notifications' },
  { key: 'profile', icon: 'person', permission: null, to: '/dashboard/profile' },
]

const MENU_LABELS = {
  dashboard: () => t('staffSidebar.dashboard'),
  appointments: () => t('staffSidebar.appointments'),
  patients: () => t('staffSidebar.myPatients'),
  prescriptions: () => t('staffSidebar.prescriptions'),
  calendar: () => 'Calendar',
  schedule: () => t('staffSidebar.mySchedule'),
  manageSchedules: () => 'Staff Schedules',
  unavailability: () => 'Staff Unavailability',
  reviews: () => t('staffSidebar.reviews'),
  staff: () => t('staffSidebar.staff'),
  departments: () => t('staffSidebar.departments'),
  inventory: () => t('staffSidebar.inventory'),
  medicationRequests: () => t('staffSidebar.medicationRequests'),
  aiChat: () => 'AI Assistant',
  medicines: () => 'Medicines',
  articles: () => 'Articles',
  jobPosts: () => 'Job Posts',
  reports: () => 'Reports',
  messages: () => 'Messages',
  notifications: () => 'Notifications',
  profile: () => t('staffSidebar.myProfile'),
}

const visibleItems = computed(() => {
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
        <img
          v-if="authStore.user?.avatar"
          :src="authStore.user.avatar"
          :alt="resolveTranslatedValue(authStore.user?.name)"
          class="w-10 h-10 rounded-full object-cover ring-2 ring-brand-primary/15 shrink-0"
        />
        <AvatarInitial v-else :name="resolveTranslatedValue(staffStore.currentUser.name)" />
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
