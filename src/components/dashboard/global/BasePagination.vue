<script setup>
defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  itemsPerPage: { type: Number, default: 10 }
});

defineEmits(['change']);
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
    <p class="text-sm text-slate-500">
      Showing <span class="font-bold text-slate-900">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> 
      to <span class="font-bold text-slate-900">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> 
      of <span class="font-bold text-slate-900">{{ totalItems }}</span> results
    </p>
    
    <div class="flex items-center gap-2">
      <button 
        class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        :disabled="currentPage === 1"
        @click="$emit('change', currentPage - 1)"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <template v-for="page in totalPages" :key="page">
        <button 
          v-if="Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages"
          class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition"
          :class="page === currentPage 
            ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15' 
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
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
        class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        :disabled="currentPage === totalPages"
        @click="$emit('change', currentPage + 1)"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
