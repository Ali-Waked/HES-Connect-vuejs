<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import HesLogo from '@/components/global/HesLogo.vue';

defineProps({
  mobileOpen: { type: Boolean, required: true }
});

defineEmits(['closeMobile']);

const { t } = useI18n();
const authStore = useAuthStore();

function can(permission) {
  return authStore.can(permission)
}

const menuGroups = computed(() => {
  const groups = [
    {
      title: () => t('sidebar.platformOverview'),
      items: [
        { id: 'dashboard', label: () => t('sidebar.dashboard'), icon: 'grid_view', permission: null },
        { id: 'audit-logs', label: () => t('sidebar.auditLogs'), icon: 'history', permission: 'activity_logs.view' },
        { id: 'reports', label: () => t('sidebar.reports'), icon: 'assessment', permission: 'reports.view' }
      ]
    },
    {
      title: () => t('sidebar.medicalOperations'),
      items: [
        { id: 'appointments', label: () => t('sidebar.appointments'), icon: 'calendar_month', permission: 'appointments.view' },
        { id: 'prescriptions', label: () => t('sidebar.prescriptions'), icon: 'description', permission: 'prescriptions.view' },
        { id: 'medication-requests', label: () => t('sidebar.medicationRequests', 'Medication Requests'), icon: 'medication', permission: 'medication_requests.view' },
        { id: 'medication-request-analytics', label: () => t('sidebar.medAnalytics'), icon: 'analytics', permission: 'analytics.view' },
        { id: 'medicines', label: () => t('sidebar.medicines'), icon: 'pill', permission: 'medicines.view' }
      ]
    },
    {
      title: () => t('sidebar.directory'),
      items: [
        { id: 'organizations', label: () => t('sidebar.organizations'), icon: 'corporate_fare', permission: 'organizations.view' },
        { id: 'organization-users', label: () => t('sidebar.organizationUsers'), icon: 'group_add', permission: 'organization_users.view' },
        { id: 'facilities', label: () => t('sidebar.facilities'), icon: 'home_health', permission: 'facilities.view' },
        { id: 'cities', label: () => t('sidebar.cities'), icon: 'location_city', permission: 'cities.view' },
        { id: 'departments', label: () => t('sidebar.departments'), icon: 'lan', permission: 'departments.view' }
      ]
    },
    {
      title: () => t('sidebar.usersAccess'),
      items: [
        { id: 'users', label: () => t('sidebar.allUsers'), icon: 'group', permission: 'users.view' },
        { id: 'roles', label: () => t('sidebar.roles'), icon: 'shield_person', permission: 'roles.view' },
        { id: 'permissions', label: () => t('sidebar.permissions'), icon: 'vpn_key', permission: 'permissions.view' },
        { id: 'tags', label: () => t('sidebar.tags'), icon: 'tag', permission: 'tags.view' }
      ]
    },
    {
      title: () => t('sidebar.contentCommunity'),
      items: [
        { id: 'categories', label: () => t('sidebar.categories'), icon: 'category', permission: 'categories.view' },
        { id: 'articles', label: () => t('sidebar.articles'), icon: 'article', permission: 'articles.view' },
        { id: 'stories', label: () => t('sidebar.stories'), icon: 'auto_stories', permission: 'stories.view' },
        { id: 'reviews', label: () => t('sidebar.reviews'), icon: 'star', permission: 'reviews.view' }
      ]
    },
    {
      title: () => t('sidebar.communications'),
      items: [
        { id: 'messages', label: () => t('sidebar.contactInbox'), icon: 'mail', permission: 'messages.view' },
        { id: 'conversations', label: () => t('sidebar.conversations'), icon: 'forum', permission: 'messages.view' }
      ]
    },
    {
      title: () => t('sidebar.system'),
      items: [
        { id: 'positions', label: () => t('sidebar.positions'), icon: 'badge', permission: 'positions.view' },
        { id: 'jobs', label: () => t('sidebar.jobBoard'), icon: 'work', permission: 'jobs.view' },
        { id: 'settings', label: () => t('sidebar.settings'), icon: 'settings', permission: 'settings.view' }
      ]
    }
  ]

  return groups
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.permission || can(item.permission))
    }))
    .filter(group => group.items.length > 0)
})
</script>

<template>
  <div>
    <!-- Sidebar Backdrop for Mobile -->
    <div 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-35 lg:hidden transition-opacity duration-300"
      :class="mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
      @click="$emit('closeMobile')"
    ></div>

    <!-- Sidebar Aside drawer -->
    <aside 
      class="fixed top-0 bottom-0 w-[280px] bg-slate-900 text-slate-100 flex flex-col p-6 z-40 transition-transform duration-300"
      :class="[
        $i18n.locale === 'ar' ? 'right-0 lg:translate-x-0' : 'left-0 lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : ($i18n.locale === 'ar' ? 'translate-x-full' : '-translate-x-full')
      ]"
    >
      <!-- Brand Logo Section -->
      <div class="flex items-center gap-3 pb-8 px-2 border-b border-white/5 dark:border-white/10 mb-6">
        <HesLogo variant="full" :height="32" theme="dark" />
      </div>

      <!-- Menu Navigation -->
      <nav class="flex-grow overflow-y-auto pr-2 custom-scrollbar -mr-2">
        <div v-for="group in menuGroups" :key="group.title" class="mb-8 last:mb-0">
          <h5 class="px-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-4">{{ group.title() }}</h5>
          <ul class="space-y-1 list-none m-0">
            <li v-for="item in group.items" :key="item.id" class="w-full">
              <router-link 
                :to="`/platform/${item.id}`"
                class="flex items-center gap-3 py-2.5 px-4 text-[13px] font-bold rounded-xl text-slate-400 hover:bg-white/5 dark:hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer group" 
                active-class="bg-brand-primary! text-white! "
                @click="$emit('closeMobile')"
              >
                <span class="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">{{ item.icon }}</span>
                <span>{{ item.label() }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="pt-6 border-t border-white/5 dark:border-white/10 flex items-center justify-between mt-auto">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('sidebar.systemOnline') }}</span>
        </div>
        <span class="text-[9px] font-bold text-slate-600 dark:text-slate-500">v2.4.0-PRO</span>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
