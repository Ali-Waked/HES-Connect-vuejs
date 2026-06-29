<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue, getNameInitial } from '@/utils/locale'
import FavoriteButton from '@/components/favorites/FavoriteButton.vue'

const props = defineProps({
  doctor: { type: Object, required: true }
})

const router = useRouter()
const { t, locale } = useI18n()
const avatarError = ref(false)

const genderBadge = {
  male: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 ring-blue-200 dark:ring-blue-800',
  female: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400 ring-pink-200 dark:ring-pink-800',
}

const facilityTypeBadge = {
  hospital: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  clinic: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  pharmacy: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
}

const avatarSrc = computed(() => props.doctor.avatar || props.doctor.profile_image || null)

const bioPreview = computed(() => {
  const bio = resolveTranslatedValue(props.doctor.bio, locale.value)
  if (!bio) return ''
  return bio.length > 100 ? bio.slice(0, 100) + '...' : bio
})

function viewProfile() {
  router.push(`/doctors/${props.doctor.uuid}`)
}
</script>

<template>
  <div
    class="group card-base hover:shadow-card-hover hover:-translate-y-0.5 transition-[transform,box-shadow] duration-500 ease-out overflow-hidden cursor-pointer"
    @click="viewProfile"
  >
    <div class="p-5">
      <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded-full shrink-0 overflow-hidden bg-gradient-to-br from-brand-primary to-brand-primary-dark ring-2 ring-slate-100 dark:ring-slate-700 cursor-pointer" @click.stop="viewProfile">
          <img
            v-if="avatarSrc && !avatarError"
            :src="avatarSrc"
            :alt="resolveTranslatedValue(doctor.name, locale.value)"
            class="w-full h-full object-cover"
            @error="avatarError = true"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="text-lg font-bold text-white">{{ getNameInitial(doctor.name, locale.value) }}</span>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors truncate">
              {{ resolveTranslatedValue(doctor.name, locale.value) }}
            </h3>
            <span
              v-if="doctor.gender"
              class="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ring-1"
              :class="genderBadge[doctor.gender] || 'bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-600'"
            >
              {{ doctor.gender === 'male' ? t('gender.male') : t('gender.female') }}
            </span>
          </div>
          <p class="text-xs font-semibold text-brand-primary mt-0.5 truncate">
            {{ resolveTranslatedValue(doctor.specialization, locale.value) }}
          </p>
          <div class="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
            <span class="truncate">{{ doctor.city || t('common.notSpecified') }}</span>
          </div>
        </div>
        <FavoriteButton :favoritable-id="doctor.uuid || doctor.id" favoritable-type="staff" :is-favorited="doctor.is_favorited" size="sm" @click.stop />
      </div>

      <div v-if="doctor.facilities_count !== undefined || doctor.primary_facility" class="flex items-center gap-2 mt-3 flex-wrap">
        <span v-if="doctor.facilities_count !== undefined" class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg>
          {{ doctor.facilities_count }} {{ t('doctorsListing.facilities') }}
        </span>
        <span
          v-if="doctor.primary_facility"
          class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold"
          :class="facilityTypeBadge[doctor.primary_facility.facility_type] || 'bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-300'"
        >
          {{ resolveTranslatedValue(doctor.primary_facility.name, locale.value) }}
        </span>
      </div>

      <p v-if="bioPreview" class="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed line-clamp-2">
        {{ bioPreview }}
      </p>

      <div class="mt-3">
        <button
          class="w-full py-2 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          @click.stop="viewProfile"
        >
          {{ t('doctorsListing.viewProfile') }}
        </button>
      </div>
    </div>
  </div>
</template>


