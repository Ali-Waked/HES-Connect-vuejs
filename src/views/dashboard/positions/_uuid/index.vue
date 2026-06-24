<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useFormatDate } from '../../../../composables/useFormatDate';
import { usePositions } from '../../../../composables/usePositions';

const route = useRoute();
const { t } = useI18n();
const { formatDate } = useFormatDate();
const { fetchPosition } = usePositions();

const loading = ref(true);
const position = ref(null);

const uuid = route.params.uuid;

onMounted(async () => {
  try {
    position.value = await fetchPosition(uuid);
  } catch (err) {
    // Error handled by composable
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <div class="flex items-center gap-3">
      <router-link
        to="/platform/positions"
        class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer inline-flex"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </router-link>
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ $t('positions.details') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('positions.title') }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <svg class="w-8 h-8 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    </div>

    <!-- Details Card -->
    <div v-else-if="position" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div class="p-6 flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ position.name?.en || position.name || '—' }}</h2>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="{
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': position.is_active,
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400': !position.is_active,
          }">
            {{ position.is_active ? $t('positions.active') : $t('positions.inactive') }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ $t('positions.name') }} (EN)</p>
            <p class="text-sm text-slate-700 dark:text-slate-300">{{ position.name?.en || position.name || '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ $t('positions.name') }} (AR)</p>
            <p class="text-sm text-slate-700 dark:text-slate-300 text-right" dir="rtl">{{ position.name?.ar || '—' }}</p>
          </div>
        </div>

        <div v-if="position.description?.en || position.description?.ar || position.description">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ $t('positions.description') }}</p>
          <p v-if="position.description?.en" class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ position.description.en }}</p>
          <p v-else class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ position.description }}</p>
        </div>

        <div class="border-t border-slate-100 dark:border-slate-800 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ $t('positions.createdAt') }}</p>
            <p class="text-sm text-slate-700 dark:text-slate-300">{{ formatDate(position.created_at) }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ $t('positions.updatedAt') }}</p>
            <p class="text-sm text-slate-700 dark:text-slate-300">{{ formatDate(position.updated_at) }}</p>
          </div>
        </div>
      </div>

      <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <router-link
          to="/platform/positions"
          class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          {{ $t('common.back') }}
        </router-link>
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
