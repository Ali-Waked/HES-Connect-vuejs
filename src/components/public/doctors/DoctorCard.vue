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

const avatarSrc = computed(() => props.doctor.avatar || props.doctor.profile_image || null)

const specialization = computed(() => resolveTranslatedValue(props.doctor.specialization, locale.value))

const facilityName = computed(() => {
  if (!props.doctor.primary_facility) return ''
  return resolveTranslatedValue(props.doctor.primary_facility.name, locale.value)
})

function viewProfile() {
  router.push(`/doctors/${props.doctor.uuid}`)
}
</script>

<template>
  <div
    class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col"
    @click="viewProfile"
  >
    <!-- Avatar Header -->
    <div class="relative h-32 bg-gradient-to-br from-brand-primary/10 via-brand-primary/5 to-transparent dark:from-brand-primary/20 dark:via-brand-primary/10 flex items-end justify-center pb-0">
      <div class="absolute top-3 right-3">
        <FavoriteButton :favoritable-id="doctor.uuid || doctor.id" favoritable-type="staff" :is-favorited="doctor.is_favorited" size="sm" @click.stop />
      </div>
      <div class="w-20 h-20 rounded-full bg-white dark:bg-slate-800 p-1 shadow-lg translate-y-10">
        <div class="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center">
          <img
            v-if="avatarSrc && !avatarError"
            :src="avatarSrc"
            :alt="resolveTranslatedValue(doctor.name, locale.value)"
            class="w-full h-full object-cover"
            @error="avatarError = true"
          />
          <span v-else class="text-2xl font-bold text-white">{{ getNameInitial(doctor.name, locale.value) }}</span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="pt-14 px-5 pb-5 flex flex-col flex-1 text-center">
      <h3 class="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors truncate">
        {{ resolveTranslatedValue(doctor.name, locale.value) }}
      </h3>

      <p v-if="specialization" class="text-xs font-semibold text-brand-primary mt-1 truncate">
        {{ specialization }}
      </p>

      <!-- Info Row -->
      <div class="flex items-center justify-center gap-3 mt-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span v-if="doctor.gender" class="inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">person</span>
          {{ doctor.gender === 'male' ? t('gender.male') : t('gender.female') }}
        </span>
        <span v-if="doctor.city" class="inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">location_on</span>
          {{ doctor.city }}
        </span>
      </div>

      <!-- Facility Badge -->
      <div v-if="facilityName" class="mt-3 inline-flex items-center gap-1.5 mx-auto px-2.5 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400">
        <span class="material-symbols-outlined text-xs">business</span>
        {{ facilityName }}
      </div>

      <!-- Facilities Count -->
      <div v-if="doctor.facilities_count" class="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
        {{ doctor.facilities_count }} {{ t('doctorsListing.facilities') }}
      </div>

      <!-- Bio Preview -->
      <p v-if="doctor.bio && resolveTranslatedValue(doctor.bio, locale.value)" class="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed line-clamp-2">
        {{ resolveTranslatedValue(doctor.bio, locale.value).length > 100 ? resolveTranslatedValue(doctor.bio, locale.value).slice(0, 100) + '...' : resolveTranslatedValue(doctor.bio, locale.value) }}
      </p>

      <!-- CTA -->
      <div class="mt-auto pt-4">
        <button
          class="w-full py-2.5 px-4 border-2 border-brand-primary/20 text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200 cursor-pointer"
          @click.stop="viewProfile"
        >
          {{ t('doctorsListing.viewProfile') }}
        </button>
      </div>
    </div>
  </div>
</template>
