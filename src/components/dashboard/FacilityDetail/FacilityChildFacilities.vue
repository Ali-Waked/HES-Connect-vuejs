<script setup>
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const { localField } = useLocaleField();
const router = useRouter();

defineProps({
  children: { type: Array, default: () => [] },
});

const facilityTypeLabels = {
  hospital: 'categories.hospital',
  clinic: 'categories.clinic',
  pharmacy: 'categories.pharmacy',
  medical_point: 'categories.medicalPoint',
};

function goToFacility(uuid) {
  router.push(`/platform/facilities/${uuid}`);
}

const statusVariant = (status) => {
  const map = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return map[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
};
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        {{ t('facilityDetail.quickStats.children') || 'Child Facilities' }}
        <span class="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{{ children.length }}</span>
      </h3>
    </div>
    <div v-if="children.length === 0" class="p-6 flex flex-col items-center justify-center py-8 text-center gap-3">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ t('common.noData') || 'No child facilities' }}</p>
    </div>
    <div v-else class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="child in children"
        :key="child.uuid || child.id"
        class="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-primary dark:hover:border-brand-primary transition cursor-pointer"
        @click="goToFacility(child.uuid || child.id)"
      >
        <div class="flex items-start justify-between gap-2 mb-2">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition line-clamp-1">
            {{ localField(child, 'name') }}
          </h4>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
            :class="statusVariant(child.status)"
          >
            {{ t(`statuses.${child.status}`) || child.status }}
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {{ t(facilityTypeLabels[child.facility_type || child.type] || 'categories.hospital') }}
        </p>
        <div class="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-primary opacity-0 group-hover:opacity-100 transition">
          <span>{{ t('common.view') }}</span>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
