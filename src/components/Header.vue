<script setup>
import { computed } from 'vue';
import { useDashboardStore } from '../stores/dashboard';

defineEmits(['toggleMobile']);

const store = useDashboardStore();

const menuItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'organizations', label: 'Organizations' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'departments', label: 'Departments' },
  { id: 'users', label: 'Users' },
  { id: 'stories', label: 'Stories' }
];

const tabTitle = computed(() => {
  const item = menuItems.find(i => i.id === store.activeTab);
  return item ? item.label : '';
});
</script>

<template>
  <header class="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 w-full">
    <!-- Left Section: Header Title (Desktop) & Menu toggle (Mobile) -->
    <div class="flex items-center gap-3">
      <button 
        class="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition"
        @click="$emit('toggleMobile')"
      >
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span class="text-base lg:text-lg font-semibold text-slate-800 tracking-tight">{{ tabTitle }}</span>
    </div>

    <!-- Right Section: Alerts & Profile dropdown -->
    <div class="flex items-center gap-4 lg:gap-5">
      <!-- Notification Icon button -->
      <button 
        class="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-full cursor-pointer transition" 
        title="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>
      
      <!-- User Profile card -->
      <div class="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition">
        <div class="w-9 h-9 bg-brand-primary text-white font-bold rounded-full flex items-center justify-center text-sm shadow-xs shadow-brand-primary/10">
          A
        </div>
        <div class="hidden sm:flex flex-col text-left">
          <span class="text-xs font-semibold text-slate-800 leading-none mb-0.5">Admin</span>
          <span class="text-[10px] text-slate-400 leading-none">admin@health.ps</span>
        </div>
        <svg class="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  </header>
</template>
