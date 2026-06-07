<script setup>
import BaseDialog from '../global/BaseDialog.vue';

defineProps({
  show: { type: Boolean, required: true },
  medicine: { type: Object, default: null }
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
    title="Medicine Information" 
    size="md"
    @close="$emit('close')"
  >
    <div v-if="medicine" class="space-y-6">
      <div class="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
        <img v-if="medicine.image" :src="medicine.image" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300">
          <span class="material-symbols-outlined text-6xl">medical_services</span>
          <p class="text-sm font-medium mt-2">No image available</p>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <h4 class="text-2xl font-bold text-slate-900">{{ medicine.name }}</h4>
          <p class="text-xs font-mono text-slate-400 mt-1 uppercase tracking-widest">UUID: {{ medicine.uuid }}</p>
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">About this Medicine</label>
          <p class="text-sm text-slate-700 leading-relaxed">{{ medicine.description || 'No description provided.' }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-white border border-slate-100 rounded-xl">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Added On</label>
            <p class="text-xs font-bold text-slate-900">{{ formatDate(medicine.created_at) }}</p>
          </div>
          <div class="p-4 bg-white border border-slate-100 rounded-xl">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Updated</label>
            <p class="text-xs font-bold text-slate-900">{{ formatDate(medicine.updated_at) }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-center pt-2">
        <button 
          @click="$emit('close')"
          class="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold rounded-xl transition shadow-lg shadow-slate-900/10"
        >
          Close Preview
        </button>
      </div>
    </div>
  </BaseDialog>
</template>
