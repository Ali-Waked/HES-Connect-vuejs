<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../../../stores/dashboard';

const store  = useDashboardStore();
const router = useRouter();

const stats = computed(() => store.userStats);

// Quick-action cards
const quickActions = [
  {
    id: 'staff',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>`,
    title: 'Staff Management',
    desc: 'View and manage medical staff â€” specializations, bios, consultation fees, and experience.',
    route: '/admin/staff',
    color: 'teal',
  },
  {
    id: 'patients',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>`,
    title: 'Patient Records',
    desc: 'Manage patient accounts and their medical history records across all facilities.',
    route: '/admin/patients',
    color: 'blue',
  },
];

// Stat card config
const statCards = computed(() => [
  {
    id: 'total',
    value: stats.value.total,
    label: 'Total Users',
    sub: 'All registered accounts',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>`,
    iconBg: 'bg-slate-100 dark:bg-slate-700',
    iconColor: 'text-slate-500 dark:text-slate-400',
    arrow: false,
  },
  {
    id: 'staff',
    value: stats.value.staff,
    label: 'Total Staff',
    sub: 'Click to manage staff',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>`,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    arrow: true,
    route: '/admin/staff',
  },
  {
    id: 'patients',
    value: stats.value.patients,
    label: 'Total Patients',
    sub: 'Click to manage patients',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>`,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    arrow: true,
    route: '/admin/patients',
  },
  {
    id: 'online',
    value: stats.value.online,
    label: 'Online Now',
    sub: 'Currently active users',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"/>`,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    arrow: false,
  },
]);

const handleStatClick = (card) => {
  if (card.route) router.push(card.route);
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- â”€â”€ Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">User Management</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Overview of all users registered in the
        <span class="text-teal-600 font-semibold">health ecosystem</span>
      </p>
    </div>

    <!-- â”€â”€ Stat Cards (4-col) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in statCards"
        :key="card.id"
        class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col gap-3 relative overflow-hidden transition-all duration-200"
        :class="card.route ? 'cursor-pointer hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5' : ''"
        @click="handleStatClick(card)"
      >
        <!-- Arrow indicator -->
        <svg v-if="card.arrow" class="absolute top-4 right-4 w-4 h-4 text-slate-300 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
        </svg>

        <!-- Icon -->
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="card.iconBg">
          <svg class="w-5 h-5" :class="card.iconColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.7" stroke="currentColor" v-html="card.icon"></svg>
        </div>

        <!-- Number + Label -->
        <div>
          <p class="text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-none mb-1">{{ card.value }}</p>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ card.label }}</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ card.sub }}</p>
        </div>

        <!-- Online pulse indicator -->
        <div v-if="card.id === 'online'" class="absolute bottom-4 right-4 flex items-center gap-1.5">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
      </div>
    </div>

    <!-- â”€â”€ Quick-Action Panels (2-col) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="action in quickActions"
        :key="action.id"
        class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs flex items-start gap-4 cursor-pointer hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 group"
        @click="router.push(action.route)"
      >
        <!-- Icon bubble -->
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="action.color === 'teal' ? 'bg-teal-50' : 'bg-blue-50'"
        >
          <svg
            class="w-5 h-5"
            :class="action.color === 'teal' ? 'text-teal-600' : 'text-blue-500'"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.7" stroke="currentColor"
            v-html="action.icon"
          ></svg>
        </div>

        <!-- Text -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">{{ action.title }}</h3>
            <!-- Arrow -->
            <svg class="w-4 h-4 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
            </svg>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{{ action.desc }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
</style>
