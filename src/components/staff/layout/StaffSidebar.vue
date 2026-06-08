<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStaffStore } from '../../../stores/useStaffStore';
import AvatarInitial from '../shared/AvatarInitial.vue';
import StatusBadge from '../shared/StatusBadge.vue';

defineProps({
  mobileOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const router = useRouter();
const route = useRoute();
const store = useStaffStore();

const links = [
  { label: 'Dashboard', icon: 'dashboard', to: '/staff/dashboard', roles: ['doctor', 'nurse', 'hospital_manager', 'pharmacist'] },
  { label: 'Appointments', icon: 'calendar_month', to: '/staff/appointments', roles: ['doctor', 'nurse', 'hospital_manager'] },
  { label: 'My Patients', icon: 'group', to: '/staff/patients', roles: ['doctor', 'nurse'] },
  { label: 'Prescriptions', icon: 'medication', to: '/staff/prescriptions', roles: ['doctor'] },
  { label: 'My Schedule', icon: 'event_available', to: '/staff/schedule', roles: ['doctor'] },
  { label: 'Reviews', icon: 'star', to: '/staff/reviews', roles: ['doctor'] },
  { label: 'Inventory', icon: 'inventory_2', to: '/staff/inventory', roles: ['pharmacist'] },
  { label: 'Medication Requests', icon: 'inbox', to: '/staff/medication-requests', roles: ['pharmacist'] },
  { label: 'Departments', icon: 'domain', to: '/staff/departments', roles: ['hospital_manager'] },
  { label: 'Staff', icon: 'badge', to: '/admin/staff', roles: ['hospital_manager'] },
  { label: 'Job Posts', icon: 'work', to: '/staff/job-posts', roles: ['hospital_manager'] },
  { label: 'Documents', icon: 'folder', to: '/staff/documents', roles: ['hospital_manager'] },
  { label: 'Reports', icon: 'analytics', to: '/staff/reports', roles: ['hospital_manager'] },
  { label: 'Messages', icon: 'chat', to: '/staff/messages', roles: ['doctor', 'nurse', 'hospital_manager', 'pharmacist'] },
  { label: 'My Profile', icon: 'person', to: '/staff/profile', roles: ['doctor', 'nurse', 'hospital_manager', 'pharmacist'] }
];

const visibleLinks = computed(() => links.filter((link) => link.roles.includes(store.currentUser.role)));

function navigate(to) {
  router.push(to);
  emit('close');
}
</script>

<template>
  <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-slate-900/30 dark:bg-slate-900/60 lg:hidden" @click="$emit('close')"></div>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-transform duration-300 lg:translate-x-0"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-[70px] items-center gap-3 border-b border-slate-100 dark:border-slate-700 px-5">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-primary/20">
        <span class="material-symbols-outlined">health_and_safety</span>
      </div>
      <div>
        <p class="text-sm font-bold text-slate-900 dark:text-slate-100">Health Garagantam</p>
        <p class="text-xs text-slate-500 dark:text-slate-400">Staff Portal</p>
      </div>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <button
        v-for="link in visibleLinks"
        :key="link.to"
        class="flex w-full items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-left text-sm font-semibold transition"
        :class="route.path === link.to ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'"
        @click="navigate(link.to)"
      >
        <span class="material-symbols-outlined text-[20px]">{{ link.icon }}</span>
        {{ link.label }}
      </button>
    </nav>

    <div class="border-t border-slate-100 dark:border-slate-700 p-4">
      <div class="flex items-center gap-3">
        <AvatarInitial :name="store.currentUser.name" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{{ store.currentUser.name }}</p>
          <StatusBadge :status="store.currentUser.role === 'hospital_manager' ? 'approved' : 'published'" />
        </div>
      </div>
      <button class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700" @click="router.push('/')">
        <span class="material-symbols-outlined text-[18px]">logout</span>
        Logout
      </button>
    </div>
  </aside>
</template>
