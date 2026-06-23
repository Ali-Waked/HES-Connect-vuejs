<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';

const { t } = useI18n();
const { localField } = useLocaleField();

defineProps({
  departments: { type: Array, default: () => [] },
});

const lightboxOpen = ref(false);
const lightboxImage = ref('');
const lightboxAlt = ref('');

function openLightbox(image, alt) {
  lightboxImage.value = image;
  lightboxAlt.value = alt;
  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {{ t('departments.title') || 'Departments' }}
        <span class="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{{ departments.length }}</span>
      </h3>
    </div>
    <div class="p-6">
      <div v-if="departments.length === 0" class="flex flex-col items-center justify-center py-8 text-center gap-3">
        <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ t('common.noData') || 'No departments' }}</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="dept in departments"
          :key="dept.uuid || dept.id"
          class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <div
            class="w-12 h-12 rounded-xl overflow-hidden bg-brand-primary/10 flex items-center justify-center shrink-0"
            :class="dept.image ? 'cursor-pointer hover:ring-2 hover:ring-brand-primary/30 transition' : ''"
            @click="dept.image && openLightbox(dept.image, localField(dept, 'name'))"
          >
            <img
              v-if="dept.image"
              :src="dept.image"
              :alt="localField(dept, 'name')"
              class="w-full h-full object-cover"
            />
            <svg v-else class="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ localField(dept, 'name') }}</h4>
              <span
                class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0"
                :class="dept.is_active
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'"
              >
                {{ dept.is_active ? t('statuses.active') : t('statuses.inactive') }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ dept.staff_count ?? 0 }} {{ t('departments.staffCount') || 'staff' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
        @click="closeLightbox"
      >
        <button
          class="absolute top-4 right-4 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition cursor-pointer"
          @click="closeLightbox"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          :src="lightboxImage"
          :alt="lightboxAlt"
          class="max-w-full max-h-[85vh] object-contain rounded-lg"
          @click.stop
        />
      </div>
    </Teleport>
  </div>
</template>
