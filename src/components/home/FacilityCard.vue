<script setup>
import FavoriteButton from '../favorites/FavoriteButton.vue'

defineProps({
  facility: { type: Object, required: true },
})

const typeStyles = {
  hospital: { bg: 'bg-red-500', label: 'Hospital' },
  clinic: { bg: 'bg-cyan-500', label: 'Clinic' },
  pharmacy: { bg: 'bg-emerald-500', label: 'Pharmacy' },
  medical_point: { bg: 'bg-amber-500', label: 'Medical Point' },
}

function typeInfo(type) {
  return typeStyles[type] || { bg: 'bg-slate-500', label: type?.replace(/_/g, ' ') || 'Facility' }
}
</script>

<template>
  <div
    class="group card-hover overflow-hidden cursor-pointer animate-fade-in-up"
    @click="$router.push(`/facilities/${facility.uuid}`)"
  >
    <div class="relative h-48 overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-primary/30">
      <img
        v-if="facility.cover_image"
        :src="facility.cover_image"
        :alt="facility.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-16 h-16 text-brand-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      </div>
      <div
        :class="`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold text-white ${typeInfo(facility.facility_type).bg}`"
      >
        {{ typeInfo(facility.facility_type).label }}
      </div>
      <div class="absolute top-3 right-3">
        <FavoriteButton :favoritable-id="facility.uuid || facility.id" favoritable-type="facility" :is-favorited="facility.is_favorited" size="sm" @click.stop />
      </div>
    </div>
    <div class="p-5">
      <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-1">
        {{ facility.name }}
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
        {{ facility.description }}
      </p>
      <div class="mt-4 flex items-center justify-between">
        <span class="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
          View Details
        </span>
      </div>
    </div>
  </div>
</template>
