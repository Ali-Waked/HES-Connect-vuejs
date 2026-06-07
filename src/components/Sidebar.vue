<script setup>
import { useDashboardStore } from '../stores/dashboard';

defineProps({
  mobileOpen: { type: Boolean, required: true }
});

const emit = defineEmits(['closeMobile']);

const store = useDashboardStore();

const menuItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'organizations', label: 'Organizations' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'departments', label: 'Departments' },
  { id: 'users', label: 'Users' },
  { id: 'stories', label: 'Stories' }
];

const navigateTo = (tabId) => {
  store.setActiveTab(tabId);
  emit('closeMobile');
};
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
      class="fixed top-0 bottom-0 left-0 w-[260px] bg-slate-900 text-slate-100 flex flex-col p-6 z-40 transition-transform duration-300 lg:translate-x-0"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Brand Logo Section -->
      <div class="flex items-center gap-3 pb-9 px-2">
        <div class="w-9 h-9 bg-brand-primary rounded-full flex items-center justify-center text-white">
          <!-- Hospital/Health Medical Cross Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-white tracking-tight">Health Ecosystem</span>
          <span class="text-[9px] font-semibold text-slate-400 tracking-wider">GAZA STRIP</span>
        </div>
      </div>

      <!-- Menu Navigation -->
      <nav class="flex-grow">
        <ul class="space-y-1.5 list-none">
          <li v-for="item in menuItems" :key="item.id" class="w-full">
            <a 
              class="flex items-center gap-3 py-3 px-4 text-sm font-medium rounded-lg transition duration-200 cursor-pointer" 
              :class="store.activeTab === item.id 
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'"
              @click.prevent="navigateTo(item.id)"
            >
              <!-- Icons -->
              <!-- Dashboard -->
              <svg v-if="item.id === 'dashboard'" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <!-- Organizations -->
              <svg v-else-if="item.id === 'organizations'" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <!-- Facilities -->
              <svg v-else-if="item.id === 'facilities'" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 10.5V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9.5M12 4a4 4 0 0 1 4 4v2.5H8V8a4 4 0 0 1 4-4z" />
              </svg>
              <!-- Departments -->
              <svg v-else-if="item.id === 'departments'" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <!-- Users -->
              <svg v-else-if="item.id === 'users'" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- Stories -->
              <svg v-else-if="item.id === 'stories'" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer -->
      <div class="pt-4 border-t border-white/5 text-[10px] font-bold text-slate-500 tracking-wider">
        ADMIN CONSOLE V1.0
      </div>
    </aside>
  </div>
</template>
