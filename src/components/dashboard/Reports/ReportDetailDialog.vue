<script setup>
import BaseDialog from '../global/BaseDialog.vue';
import JsonViewer from '../global/JsonViewer.vue';

defineProps({
  show: { type: Boolean, required: true },
  report: { type: Object, default: null }
});

defineEmits(['close']);

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString();
};
</script>

<template>
  <BaseDialog 
    :show="show" 
    title="Report Details" 
    size="lg"
    @close="$emit('close')"
  >
    <div v-if="report" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
          <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Report ID</p>
          <p class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ report.id }}</p>
        </div>
        <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
          <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Type</p>
          <p class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ report.type }}</p>
        </div>
        <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
          <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Generated At</p>
          <p class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ formatDate(report.generated_at) }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Report Data</label>
        <JsonViewer :data="report.data" />
      </div>
    </div>
  </BaseDialog>
</template>
