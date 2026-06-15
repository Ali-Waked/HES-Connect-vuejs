<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';
import { usePositions } from '../../../composables/usePositions';

const props = defineProps({
  show: { type: Boolean, required: true },
  positionUuid: { type: String, default: null }
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();
const { fetchPosition } = usePositions();

const position = ref(null);
const loading = ref(false);

watch(() => props.show, async (val) => {
  if (val && props.positionUuid) {
    loading.value = true;
    try {
      const data = await fetchPosition(props.positionUuid);
      position.value = data;
    } catch (e) {
      position.value = null;
    } finally {
      loading.value = false;
    }
  } else {
    position.value = null;
  }
});
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('positions.details') }}</h3>
        <button
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition"
          @click="$emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-16">
        <svg class="w-6 h-6 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>

      <div v-else-if="position" class="p-6 overflow-y-auto flex-1 space-y-5">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ localField(position, 'name') || '—' }}</h2>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="{
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': position.is_active,
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400': !position.is_active,
          }">
            {{ position.is_active ? $t('positions.active') : $t('positions.inactive') }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('positions.name') }} (EN)</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ position.name?.en || position.name || '—' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('positions.name') }} (AR)</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 text-right" dir="rtl">{{ position.name?.ar || '—' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('positions.createdAt') }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ formatDate(position.created_at) }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('positions.updatedAt') }}</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{{ formatDate(position.updated_at) }}</p>
          </div>
        </div>

        <div v-if="position.description?.en || position.description?.ar || position.description">
          <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{{ $t('positions.description') }}</h4>
          <p v-if="position.description?.en" class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ position.description.en }}</p>
          <p v-else class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ position.description || '—' }}</p>
          <template v-if="position.description?.ar">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-4">{{ $t('positions.description') }} (AR)</h4>
            <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-right" dir="rtl">{{ position.description.ar }}</p>
          </template>
        </div>
      </div>

      <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button type="button" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="$emit('close')">
          {{ $t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
