<script setup>
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'

defineProps({
  trending: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const { t } = useI18n()
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('searchHistory.trendingTitle') }}</h3>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="p-5 space-y-3">
      <div v-for="i in 5" :key="i" class="flex items-center gap-3 animate-pulse">
        <div class="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
        <div class="flex-1 space-y-1.5">
          <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/5"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="trending.length === 0" class="flex flex-col items-center justify-center py-10 px-6 text-center gap-3">
      <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">{{ t('searchHistory.noTrending') }}</p>
    </div>

    <!-- Trending Items -->
    <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
      <div
        v-for="(item, idx) in trending"
        :key="item.query + idx"
        class="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
        @click="$emit('select', item)"
      >
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
          :class="[
            idx === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
            idx === 1 ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
            idx === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
            'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
          ]"
        >
          {{ idx + 1 }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ item.query }}</p>
          <p v-if="item.count != null" class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {{ item.count }} {{ t('searchHistory.searches') || 'searches' }}
          </p>
        </div>
        <svg class="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
        </svg>
      </div>
    </div>
  </div>
</template>
