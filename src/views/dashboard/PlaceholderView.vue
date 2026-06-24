<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  tab: { type: String, default: '' }
});

const route = useRoute();

const tabName = computed(() => props.tab || route.name || 'page');

const tabConfig = computed(() => {
  const configs = {
    departments: {
      title: 'Departments',
      subtitle: 'Manage clinical departments and units within organizations',
      icon: 'departments',
      color: 'purple',
      emoji: '🏥'
    },
    users: {
      title: 'Users',
      subtitle: 'Manage system users, roles, and access permissions',
      icon: 'users',
      color: 'blue',
      emoji: '👥'
    },
    stories: {
      title: 'Stories',
      subtitle: 'Browse and manage healthcare impact stories from the field',
      icon: 'stories',
      color: 'teal',
      emoji: '📖'
    }
  };
  return configs[tabName.value] || {
    title: tabName.value.charAt(0).toUpperCase() + tabName.value.slice(1),
    subtitle: 'This section is coming soon',
    icon: 'default',
    color: 'slate',
    emoji: '📋'
  };
});
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">{{ tabConfig.title }}</h1>
        <p class="text-sm text-slate-500">{{ tabConfig.subtitle }}</p>
      </div>
    </div>

    <!-- Coming Soon Card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="flex flex-col items-center justify-center py-24 px-8 text-center">
        <div class="text-6xl mb-6">{{ tabConfig.emoji }}</div>
        <h2 class="text-xl font-bold text-slate-800 mb-2">{{ tabConfig.title }} Coming Soon</h2>
        <p class="text-sm text-slate-500 max-w-sm mb-8">
          This section is under active development. Check back soon to manage {{ tabConfig.title.toLowerCase() }} for the Health Ecosystem.
        </p>
        <div class="flex gap-3">
          <router-link
            to="/platform/dashboard"
            class="inline-flex items-center justify-center py-2.5 px-5 text-sm font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer shadow-md shadow-teal-600/15"
          >
            ← Back to Dashboard
          </router-link>
          <router-link
            to="/platform/organizations"
            class="inline-flex items-center justify-center py-2.5 px-5 text-sm font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
          >
            Go to Organizations
          </router-link>
        </div>
      </div>
    </div>

    <!-- Placeholder stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="n in 3" :key="n" class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div class="h-3 bg-slate-100 rounded-full w-1/2 mb-3 animate-pulse"></div>
        <div class="h-7 bg-slate-100 rounded-full w-1/3 mb-1 animate-pulse"></div>
        <div class="h-2.5 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
