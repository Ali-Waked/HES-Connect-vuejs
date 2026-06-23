<script setup>
import { useI18n } from 'vue-i18n';
import { useLocaleField } from '../../../composables/useLocaleField';
import { useFormatDate } from '../../../composables/useFormatDate';

const { t } = useI18n();
const { localField } = useLocaleField();
const { formatDate } = useFormatDate();

defineProps({
  facility: { type: Object, required: true },
});

const facilityTypeLabels = {
  hospital: 'categories.hospital',
  clinic: 'categories.clinic',
  pharmacy: 'categories.pharmacy',
  medical_point: 'categories.medicalPoint',
};

const infoItems = [
  { key: 'name', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', labelKey: 'facilities.name' },
  { key: 'type', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', labelKey: 'facilities.type' },
  { key: 'status', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', labelKey: 'common.status' },
  { key: 'approval', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', labelKey: 'facilities.approval' },
  { key: 'city', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', labelKey: 'facilities.city' },
  { key: 'organization', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5', labelKey: 'facilities.organization' },
  { key: 'owner', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', labelKey: 'facilities.owner' },
  { key: 'email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', labelKey: 'common.email' },
  { key: 'parent', icon: 'M8 7l4-4m0 0l4 4m-4-4v18', labelKey: 'facilities.parent' },
  { key: 'latitude', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', labelKey: 'facilities.latitude' },
  { key: 'longitude', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', labelKey: 'facilities.longitude' },
  { key: 'created_at', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', labelKey: 'reviews.createdAt' },
  { key: 'updated_at', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', labelKey: 'facilityDetail.updatedAt' },
];
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ t('facilityDetail.pageTitle') || 'Facility Information' }}
      </h3>
    </div>
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <template v-for="item in infoItems" :key="item.key">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t(item.labelKey) }}</p>

              <template v-if="item.key === 'name'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ localField(facility, 'name') || '—' }}</p>
              </template>
              <template v-else-if="item.key === 'type'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ t(facilityTypeLabels[facility.facility_type || facility.type] || 'categories.hospital') }}</p>
              </template>
              <template v-else-if="item.key === 'status'">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="{
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': facility.status === 'active',
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': facility.status === 'inactive',
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': facility.status === 'pending',
                }">
                  {{ t(`statuses.${facility.status}`) || facility.status }}
                </span>
              </template>
              <template v-else-if="item.key === 'approval'">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="{
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': facility.approval_status === 'approved',
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': facility.approval_status === 'rejected',
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': facility.approval_status === 'pending',
                }">
                  {{ t(`statuses.${facility.approval_status}`) || facility.approval_status }}
                </span>
              </template>
              <template v-else-if="item.key === 'city'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ localField(facility.city, 'name') || '—' }}</p>
              </template>
              <template v-else-if="item.key === 'organization'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ localField(facility.organization, 'name') || t('facilities.noOrganization') }}</p>
              </template>
              <template v-else-if="item.key === 'owner'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ localField(facility.owner, 'name') || t('facilities.noOwner') }}</p>
              </template>
              <template v-else-if="item.key === 'email'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ facility.owner?.email || '—' }}</p>
              </template>
              <template v-else-if="item.key === 'parent'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ facility.parent ? localField(facility.parent, 'name') : t('facilities.noParent') }}</p>
              </template>
              <template v-else-if="item.key === 'latitude'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white font-mono">{{ facility.latitude || '—' }}</p>
              </template>
              <template v-else-if="item.key === 'longitude'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white font-mono">{{ facility.longitude || '—' }}</p>
              </template>
              <template v-else-if="item.key === 'created_at'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatDate(facility.created_at) }}</p>
              </template>
              <template v-else-if="item.key === 'updated_at'">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatDate(facility.updated_at) }}</p>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
