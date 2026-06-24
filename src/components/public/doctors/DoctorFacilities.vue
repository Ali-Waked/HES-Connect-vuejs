<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'

defineProps({
  facilities: { type: Array, default: () => [] }
})

const router = useRouter()
const { locale } = useI18n()

const typeBadge = {
  hospital: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800',
  clinic: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800',
  pharmacy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800',
}

function goToFacility(id) {
  if (id) router.push(`/facilities/${id}`)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="fac in facilities"
      :key="fac.id || fac.uuid"
      class="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md hover:border-brand-primary/30 transition-all cursor-pointer"
      @click="goToFacility(fac.uuid || fac.id)"
    >
      <div class="w-12 h-12 rounded-lg shrink-0 bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
        <img
          v-if="fac.image"
          :src="fac.image"
          :alt="resolveTranslatedValue(fac.name, locale.value)"
          class="w-full h-full object-cover"
        />
        <svg v-else class="w-6 h-6 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            v-if="fac.facility_type"
            class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize"
            :class="typeBadge[fac.facility_type] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-600'"
          >
            {{ fac.facility_type.replace('_', ' ') }}
          </span>
        </div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
          {{ resolveTranslatedValue(fac.name, locale.value) }}
        </h3>
        <p v-if="fac.organization_name" class="text-xs text-slate-400 dark:text-slate-500 truncate">
          {{ fac.organization_name }}
        </p>
      </div>
      <div class="text-right shrink-0 hidden sm:block">
        <p v-if="fac.position" class="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {{ resolveTranslatedValue(fac.position, locale.value) }}
        </p>
        <p v-if="fac.departments?.length" class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
          {{ fac.departments.map(d => resolveTranslatedValue(d.name, locale.value)).join(', ') }}
        </p>
      </div>
      <svg class="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
    </div>
  </div>
</template>
