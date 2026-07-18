<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useSpecializations } from '../../../composables/useSpecializations';
import * as symptomService from '@/services/symptomService';

const props = defineProps({
  show: { type: Boolean, required: true },
  specialization: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { localField } = useLocaleField();
const { currentSymptoms, fetchSpecializationSymptoms, syncSymptoms, attachSymptoms, detachSymptom, saving } = useSpecializations();

const allSymptoms = ref([]);
const selectedIds = ref([]);
const searchQuery = ref('');
const mode = ref('sync'); // 'sync' | 'attach'
const loadingData = ref(false);

watch(() => props.show, async (val) => {
  if (val && props.specialization?.uuid) {
    loadingData.value = true;
    try {
      const [current, all] = await Promise.all([
        fetchSpecializationSymptoms(props.specialization.uuid),
        symptomService.getSymptoms({ per_page: 100 })
      ]);
      allSymptoms.value = all.data.data || [];
      selectedIds.value = (current || []).map(s => s.id);
    } catch {
      allSymptoms.value = [];
      selectedIds.value = [];
    } finally {
      loadingData.value = false;
    }
  }
});

const filteredSymptoms = ref([]);
watch([allSymptoms, searchQuery], () => {
  const q = searchQuery.value.toLowerCase();
  filteredSymptoms.value = allSymptoms.value.filter(s => {
    const name = s.name?.en || '';
    const nameAr = s.name?.ar || '';
    return name.toLowerCase().includes(q) || nameAr.includes(q);
  });
}, { immediate: true });

function toggleSymptom(id) {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(idx, 1);
  }
}

function isAttached(id) {
  return currentSymptoms.value.some(s => s.id === id);
}

async function handleSync() {
  const result = await syncSymptoms(props.specialization.uuid, selectedIds.value);
  if (result.success) emit('close');
}

async function handleAttach() {
  const idsToAttach = selectedIds.value.filter(id => !isAttached(id));
  if (idsToAttach.length === 0) return;
  const result = await attachSymptoms(props.specialization.uuid, idsToAttach);
  if (result.success) emit('close');
}

async function handleDetach(id) {
  await detachSymptom(props.specialization.uuid, id);
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-[600px] shadow-2xl flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ $t('specializations.manageSymptoms') }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ localField(specialization, 'name') }}
          </p>
        </div>
        <button
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="$emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Current symptoms -->
        <div v-if="currentSymptoms.length > 0" class="px-6 pt-4">
          <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            {{ $t('specializations.attachedSymptoms') }} ({{ currentSymptoms.length }})
          </p>
          <div class="flex flex-wrap gap-1.5 mb-3">
            <span
              v-for="symptom in currentSymptoms"
              :key="symptom.id"
              class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold border border-brand-primary/20"
            >
              {{ localField(symptom, 'name') }}
              <button
                class="ml-0.5 text-brand-primary/60 hover:text-red-500 transition cursor-pointer"
                @click="handleDetach(symptom.id)"
                :title="$t('common.delete')"
              >
                <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        </div>

        <!-- Mode toggle -->
        <div class="px-6 pt-3 flex gap-2">
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer"
            :class="mode === 'sync' ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
            @click="mode = 'sync'"
          >
            {{ $t('specializations.syncMode') }}
          </button>
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer"
            :class="mode === 'attach' ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
            @click="mode = 'attach'"
          >
            {{ $t('specializations.attachMode') }}
          </button>
        </div>

        <!-- Search -->
        <div class="px-6 pt-3">
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition"
              :placeholder="$t('specializations.searchSymptoms')"
              v-model="searchQuery"
            />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingData" class="flex items-center justify-center py-8">
          <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>

        <!-- Symptoms list -->
        <div v-else class="flex-1 overflow-y-auto px-6 py-3 space-y-1">
          <div
            v-for="symptom in filteredSymptoms"
            :key="symptom.id"
            class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
            @click="toggleSymptom(symptom.id)"
          >
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center transition shrink-0"
              :class="selectedIds.includes(symptom.id) ? 'bg-brand-primary border-brand-primary' : 'border-slate-300 dark:border-slate-600'"
            >
              <svg v-if="selectedIds.includes(symptom.id)" class="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {{ localField(symptom, 'name') }}
              </p>
            </div>
            <span
              v-if="isAttached(symptom.id)"
              class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase"
            >
              {{ $t('specializations.attached') }}
            </span>
          </div>
          <p v-if="filteredSymptoms.length === 0" class="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
            {{ $t('specializations.noSymptoms') }}
          </p>
        </div>

        <!-- Footer -->
        <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            @click="$emit('close')"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="button"
            :disabled="saving"
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
            @click="mode === 'sync' ? handleSync() : handleAttach()"
          >
            <svg v-if="saving" class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            {{ mode === 'sync' ? $t('specializations.syncSymptoms') : $t('specializations.attachSelected') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
