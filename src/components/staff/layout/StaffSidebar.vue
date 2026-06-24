<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../../stores/auth';
import { useStaffStore } from '../../../stores/useStaffStore';
import AvatarInitial from '../shared/AvatarInitial.vue';
import StatusBadge from '../shared/StatusBadge.vue';
import HesLogo from '../../global/HesLogo.vue';
import { resolveTranslatedValue } from '../../../utils/locale';

defineProps({
  mobileOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const staffStore = useStaffStore();
const { t } = useI18n();

const allLinks = [
  { label: () => t('staffSidebar.dashboard'), icon: 'dashboard', to: '/facility/dashboard', permission: null },
  { label: () => t('staffSidebar.appointments'), icon: 'calendar_month', to: '/facility/appointments', permission: 'appointments.view' },
  { label: () => t('staffSidebar.myPatients'), icon: 'group', to: '/facility/patients', permission: 'patients.view' },
  { label: () => t('staffSidebar.prescriptions'), icon: 'medication', to: '/facility/prescriptions', permission: 'prescriptions.view' },
  { label: () => t('staffSidebar.mySchedule'), icon: 'event_available', to: '/facility/schedule', permission: 'schedule.view' },
  { label: () => t('staffSidebar.reviews'), icon: 'star', to: '/facility/reviews', permission: 'reviews.view' },
  { label: () => t('staffSidebar.inventory'), icon: 'inventory_2', to: '/facility/inventory', permission: 'inventory.view' },
  { label: () => t('staffSidebar.medicationRequests'), icon: 'inbox', to: '/facility/medication-requests', permission: 'medication_requests.view' },
  { label: () => t('staffSidebar.departments'), icon: 'domain', to: '/facility/departments', permission: 'departments.view' },
  { label: () => t('staffSidebar.staff'), icon: 'badge', to: '/platform/staff', permission: 'staff.view' },
  { label: () => t('staffSidebar.jobPosts'), icon: 'work', to: '/facility/job-posts', permission: 'job_posts.view' },
  { label: () => t('staffSidebar.documents'), icon: 'folder', to: '/facility/documents', permission: 'documents.view' },
  { label: () => t('staffSidebar.reports'), icon: 'analytics', to: '/facility/reports', permission: 'reports.view' },
  { label: () => t('staffSidebar.messages'), icon: 'chat', to: '/facility/messages', permission: 'messages.view' },
  { label: () => t('staffSidebar.myProfile'), icon: 'person', to: '/facility/profile', permission: null }
];

const visibleLinks = computed(() => {
  if (authStore.isSuperAdmin()) return allLinks
  return allLinks.filter(link => !link.permission || authStore.can(link.permission))
})

function navigate(to) {
  router.push(to);
  emit('close');
}
</script>

<template>
  <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-slate-900/30/60 lg:hidden" @click="$emit('close')"></div>
  <aside
    class="fixed inset-y-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-300"
    :class="[
      $i18n.locale === 'ar' ? 'right-0 border-l border-r-0 lg:translate-x-0' : 'left-0 lg:translate-x-0',
      mobileOpen ? 'translate-x-0' : ($i18n.locale === 'ar' ? 'translate-x-full' : '-translate-x-full')
    ]"
  >
    <div class="flex h-[70px] items-center border-b border-slate-100 px-5">
      <HesLogo variant="full" :height="32" theme="light" />
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <button
        v-for="link in visibleLinks"
        :key="link.to"
        class="flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm font-semibold transition"
        :class="route.path === link.to ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        @click="navigate(link.to)"
      >
        <span class="material-symbols-outlined text-[20px]">{{ link.icon }}</span>
        {{ link.label() }}
      </button>
    </nav>

    <div class="border-t border-slate-100 p-4">
      <div class="flex items-center gap-3">
            <AvatarInitial :name="resolveTranslatedValue(staffStore.currentUser.name)" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-slate-900 truncate">{{ resolveTranslatedValue(staffStore.currentUser.name) }}</p>
              <p class="text-xs text-slate-500 truncate">Facility User</p>
            </div>
      </div>
      <button class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50" @click="router.push('/')">
        <span class="material-symbols-outlined text-[18px]">logout</span>
        {{ t('staffSidebar.logout') }}
      </button>
    </div>
  </aside>
</template>
