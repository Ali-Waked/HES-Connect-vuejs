<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  itemsPerPage: { type: Number, default: 10 }
});

const emit = defineEmits(['change']);

const isRtl = computed(() => locale.value === 'ar');

function prevPage() {
  emit('change', props.currentPage - 1);
}

function nextPage() {
  emit('change', props.currentPage + 1);
}
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
    <p class="text-sm text-slate-500 dark:text-slate-400">
      {{ $t('common.showing') || 'Showing' }} <span class="font-bold text-slate-900 dark:text-white">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> 
      {{ $t('common.to') || 'to' }} <span class="font-bold text-slate-900 dark:text-white">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> 
      {{ $t('common.of') || 'of' }} <span class="font-bold text-slate-900 dark:text-white">{{ totalItems }}</span> {{ $t('common.results') || 'results' }}
    </p>
    
    <div class="flex items-center gap-2">
      <button 
        class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        :disabled="currentPage === 1"
        @click="isRtl ? nextPage() : prevPage()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path v-if="isRtl" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <template v-for="page in totalPages" :key="page">
        <button 
          v-if="Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages"
          class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition"
          :class="page === currentPage 
            ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'"
          @click="$emit('change', page)"
        >
          {{ page }}
        </button>
        <span 
          v-else-if="Math.abs(page - currentPage) === 2" 
          class="px-1 text-slate-400"
        >...</span>
      </template>

      <button 
        class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        :disabled="currentPage === totalPages"
        @click="isRtl ? prevPage() : nextPage()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path v-if="isRtl" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
