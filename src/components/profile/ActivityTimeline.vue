<script setup>
import { computed } from 'vue';
import { useProfile } from '../../composables/useProfile';

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  hasMore: { type: Boolean, default: false },
  error: { type: String, default: '' }
});

defineEmits(['load-more']);

const { formatDateTime } = useProfile(computed(() => ({})));

const typeStyles = {
  login: 'bg-blue-50 text-blue-700 ring-blue-100',
  security: 'bg-amber-50 text-amber-700 ring-amber-100',
  clinical: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  system: 'bg-slate-50 text-slate-700 ring-slate-100'
};

function styleFor(type) {
  return typeStyles[type] || typeStyles.system;
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">Recent Activity</h2>
        <p class="mt-1 text-sm text-slate-500">Recent logins, changes, and system actions from audit logs.</p>
      </div>
      <span v-if="error" class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{{ error }}</span>
    </div>

    <div v-if="loading && !items.length" class="mt-6 space-y-4">
      <div v-for="index in 4" :key="index" class="flex gap-4">
        <div class="h-10 w-10 animate-pulse rounded-full bg-slate-200"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 w-48 animate-pulse rounded bg-slate-200"></div>
          <div class="h-3 w-full animate-pulse rounded bg-slate-100"></div>
        </div>
      </div>
    </div>

    <div v-else-if="!items.length" class="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <span class="material-symbols-outlined text-3xl text-slate-300">history</span>
      <h3 class="mt-2 text-sm font-semibold text-slate-900">No activity yet</h3>
      <p class="mt-1 text-sm text-slate-500">Audit log events will appear here.</p>
    </div>

    <ol v-else class="mt-6 space-y-1">
      <li v-for="(item, index) in items" :key="item.id" class="relative flex gap-4 pb-6">
        <div class="flex flex-col items-center">
          <span class="flex h-10 w-10 items-center justify-center rounded-full ring-1" :class="styleFor(item.type)">
            <span class="material-symbols-outlined text-[18px]">
              {{ item.type === 'login' ? 'login' : item.type === 'security' ? 'shield_lock' : item.type === 'clinical' ? 'medical_services' : 'settings_suggest' }}
            </span>
          </span>
          <span v-if="index !== items.length - 1" class="mt-2 h-full w-px bg-slate-200"></span>
        </div>
        <div class="min-w-0 flex-1 rounded-xl border border-slate-100 p-4">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <h3 class="text-sm font-semibold text-slate-950">{{ item.title }}</h3>
            <time class="text-xs font-medium text-slate-400">{{ formatDateTime(item.occurredAt) }}</time>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-500">{{ item.description }}</p>
        </div>
      </li>
    </ol>

    <div v-if="items.length" class="mt-2 flex justify-center border-t border-slate-100 pt-5">
      <button
        type="button"
        :disabled="loading || !hasMore"
        class="h-10 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        @click="$emit('load-more')"
      >
        {{ loading ? 'Loading...' : hasMore ? 'Load More' : 'No More Activity' }}
      </button>
    </div>
  </section>
</template>
