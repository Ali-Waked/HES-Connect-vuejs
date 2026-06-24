<script setup>
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useDashboardHelpers } from '../../../composables/useDashboardHelpers';
import BaseBadge from '../global/BaseBadge.vue';

const { t } = useI18n();
const { localField } = useLocaleField();
const { getTypeClass } = useDashboardHelpers();

const props = defineProps({
  facility: { type: Object, required: true },
});

const emit = defineEmits(['back']);

const facilityTypeLabels = {
  hospital: 'categories.hospital',
  clinic: 'categories.clinic',
  pharmacy: 'categories.pharmacy',
  medical_point: 'categories.medicalPoint',
};

const statusVariant = (status) => {
  const map = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning',
    temporarily_closed: 'warning',
    permanently_closed: 'danger',
  };
  return map[status] || 'neutral';
};

const approvalVariant = (status) => {
  const map = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning',
  };
  return map[status] || 'neutral';
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div v-if="facility.cover_image" class="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden">
      <img
        :src="facility.cover_image"
        :alt="localField(facility, 'name')"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
      <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="space-y-2">
            <nav class="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest">
              <button @click="emit('back')" class="hover:text-white transition cursor-pointer">{{ t('sidebar.facilities') }}</button>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-white/80">{{ localField(facility, 'name') }}</span>
            </nav>
            <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight">{{ localField(facility, 'name') }}</h1>
            <div class="flex items-center gap-2 flex-wrap">
              <BaseBadge variant="primary" :class="getTypeClass(facility.facility_type || facility.type)">
                {{ t(facilityTypeLabels[facility.facility_type || facility.type] || 'categories.hospital') }}
              </BaseBadge>
              <BaseBadge :variant="statusVariant(facility.status)">
                {{ t(`statuses.${facility.status}`) || facility.status }}
              </BaseBadge>
              <BaseBadge :variant="approvalVariant(facility.approval_status)">
                {{ t(`statuses.${facility.approval_status}`) || facility.approval_status }}
              </BaseBadge>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <button
              @click="emit('back')"
              class="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-bold rounded-lg hover:bg-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {{ t('common.back') }}
            </button>
            <router-link
              :to="`/platform/facilities?edit=${facility.uuid}`"
              class="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-bold rounded-lg hover:bg-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {{ t('facilities.editFacility') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-4">
      <nav class="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        <button @click="emit('back')" class="hover:text-brand-primary transition cursor-pointer">{{ t('sidebar.facilities') }}</button>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-slate-600 dark:text-slate-400">{{ localField(facility, 'name') }}</span>
      </nav>
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="space-y-2">
          <h1 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ localField(facility, 'name') }}</h1>
          <div class="flex items-center gap-2 flex-wrap">
            <BaseBadge variant="primary" :class="getTypeClass(facility.facility_type || facility.type)">
              {{ t(facilityTypeLabels[facility.facility_type || facility.type] || 'categories.hospital') }}
            </BaseBadge>
            <BaseBadge :variant="statusVariant(facility.status)">
              {{ t(`statuses.${facility.status}`) || facility.status }}
            </BaseBadge>
            <BaseBadge :variant="approvalVariant(facility.approval_status)">
              {{ t(`statuses.${facility.approval_status}`) || facility.approval_status }}
            </BaseBadge>
          </div>
        </div>
        <div class="flex gap-2 shrink-0">
          <button
            @click="emit('back')"
            class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ t('common.back') }}
          </button>
          <router-link
            :to="`/platform/facilities?edit=${facility.uuid}`"
            class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {{ t('facilities.editFacility') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>
