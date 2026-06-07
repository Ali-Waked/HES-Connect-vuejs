<script setup>
defineProps({
  mobileOpen: { type: Boolean, required: true }
});

defineEmits(['closeMobile']);

const menuGroups = [
  {
    title: 'Platform Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
      { id: 'audit-logs', label: 'Audit Logs', icon: 'history' },
      { id: 'reports', label: 'Reports', icon: 'assessment' }
    ]
  },
  {
    title: 'Medical Operations',
    items: [
      { id: 'appointments', label: 'Appointments', icon: 'calendar_month' },
      { id: 'prescriptions', label: 'Prescriptions', icon: 'description' },
      { id: 'medication-requests', label: 'Med. Requests', icon: 'medication_liquid' },
      { id: 'medicines', label: 'Medicines', icon: 'pill' }
    ]
  },
  {
    title: 'Directory',
    items: [
      { id: 'organizations', label: 'Organizations', icon: 'corporate_fare' },
      { id: 'facilities', label: 'Facilities', icon: 'home_health' },
      { id: 'departments', label: 'Departments', icon: 'lan' },
      { id: 'staff', label: 'Staff', icon: 'medical_information' },
      { id: 'patients', label: 'Patients', icon: 'patient_list' }
    ]
  },
  {
    title: 'Users & Access',
    items: [
      { id: 'users', label: 'All Users', icon: 'group' },
      { id: 'roles', label: 'Roles', icon: 'shield_person' },
      { id: 'permissions', label: 'Permissions', icon: 'vpn_key' },
      { id: 'tags', label: 'Tags', icon: 'tag' }
    ]
  },
  {
    title: 'Content & Community',
    items: [
      { id: 'articles', label: 'Articles', icon: 'article' },
      { id: 'stories', label: 'Stories', icon: 'auto_stories' },
      { id: 'reviews', label: 'Reviews', icon: 'star' },
      { id: 'comments', label: 'Comments', icon: 'chat_bubble' }
    ]
  },
  {
    title: 'Communications',
    items: [
      { id: 'messages', label: 'Contact Inbox', icon: 'mail' },
      { id: 'conversations', label: 'Conversations', icon: 'forum' }
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'jobs', label: 'Job Board', icon: 'work' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ]
  }
];
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
      class="fixed top-0 bottom-0 left-0 w-[280px] bg-slate-900 text-slate-100 flex flex-col p-6 z-40 transition-transform duration-300 lg:translate-x-0"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Brand Logo Section -->
      <div class="flex items-center gap-3 pb-8 px-2 border-b border-white/5 mb-6">
        <div class="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 font-bold">
          <span class="material-symbols-outlined text-2xl font-bold">clinical_notes</span>
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-black text-white tracking-tight truncate">HES Super Admin</span>
          <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Platform Owner</span>
        </div>
      </div>

      <!-- Menu Navigation -->
      <nav class="flex-grow overflow-y-auto pr-2 custom-scrollbar -mr-2">
        <div v-for="group in menuGroups" :key="group.title" class="mb-8 last:mb-0">
          <h5 class="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-4">{{ group.title }}</h5>
          <ul class="space-y-1 list-none pl-0 m-0">
            <li v-for="item in group.items" :key="item.id" class="w-full">
              <router-link 
                :to="`/admin/${item.id}`"
                class="flex items-center gap-3 py-2.5 px-4 text-[13px] font-bold rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 cursor-pointer group" 
                active-class="bg-brand-primary! text-white! shadow-lg shadow-brand-primary/25"
                @click="$emit('closeMobile')"
              >
                <span class="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider">System Online</span>
        </div>
        <span class="text-[9px] font-bold text-slate-600">v2.4.0-PRO</span>
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
