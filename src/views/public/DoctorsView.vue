<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDoctorsStore } from '@/stores/useDoctorsStore'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import { resolveTranslatedValue, getNameInitial } from '@/utils/locale'
import FavoriteButton from '@/components/favorites/FavoriteButton.vue'

const router = useRouter()
const { t, locale } = useI18n()
const store = useDoctorsStore()
const avatarErrors = ref({})

const facilityTypes = computed(() =>
  store.facilityTypes.map(ft => ({ ...ft, label: t(ft.labelKey) }))
)

const skeletonItems = Array.from({ length: 6 }, (_, i) => i)

function coverImage(doc) {
  if (doc.cover_image) return doc.cover_image
  return null
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
      <!-- Hero -->
      <div class="text-center mb-10">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {{ t('doctorsListing.pageTitle') }}
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {{ t('doctorsListing.pageDescription') }}
        </p>
      </div>

      <!-- Search -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4 max-w-3xl mx-auto">
        <div class="relative flex-grow">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            v-model="store.filters.search"
            type="text"
            :placeholder="t('doctorsListing.searchPlaceholder')"
            class="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 shadow-sm transition"
            @keyup.enter="store.setSearch(store.filters.search)"
          />
        </div>
      </div>

      <!-- Type Filter Buttons -->
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <button
          v-for="ft in facilityTypes"
          :key="ft.value"
          class="rounded-full px-4 py-2 text-xs font-bold border transition-all cursor-pointer"
          :class="store.filters.facility_type === ft.value
            ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-primary/40 hover:text-brand-primary bg-white dark:bg-slate-800'"
          @click="store.setFacilityType(ft.value)"
        >
          {{ ft.label }}
        </button>
      </div>

      <!-- Active Filters -->
      <div v-if="store.hasActiveFilters" class="flex justify-center items-center gap-2 mb-6 text-sm">
        <span v-if="store.filters.search" class="inline-flex items-center gap-1 px-3 py-0.5 text-xs font-bold bg-brand-primary/10 text-brand-primary rounded-full">
          "{{ store.filters.search }}"
        </span>
        <span v-if="store.filters.facility_type" class="inline-flex items-center gap-1 px-3 py-0.5 text-xs font-bold bg-brand-primary/10 text-brand-primary rounded-full">
          {{ facilityTypes.find(f => f.value === store.filters.facility_type)?.label || store.filters.facility_type }}
        </span>
        <button class="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-primary underline underline-offset-2 cursor-pointer" @click="store.clearFilters">
          {{ t('doctorsListing.clearFilters') }}
        </button>
      </div>

      <!-- Results Count -->
      <div v-if="!store.loading && store.doctors.length" class="mb-6">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ t('doctorsListing.showing') }}
          <span class="font-bold text-slate-900 dark:text-white">{{ store.pagination.from || store.doctors.length }}</span>
          {{ t('common.of') }}
          <span class="font-bold text-slate-900 dark:text-white">{{ store.pagination.total }}</span>
          {{ t('doctorsListing.results') }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in skeletonItems" :key="n" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
          <div class="aspect-[16/10] bg-slate-200 dark:bg-slate-700"></div>
          <div class="p-5 space-y-3">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div class="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl w-full mt-2"></div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="store.doctors.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-14 h-14 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
          <span class="material-symbols-outlined text-2xl">person_off</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('doctorsListing.noResultsTitle') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">{{ t('doctorsListing.noResultsDesc') }}</p>
        <button class="px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition cursor-pointer" @click="store.clearFilters">
          {{ t('doctorsListing.clearFilters') }}
        </button>
      </div>

      <!-- Doctors Grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div
          v-for="doc in store.doctors"
          :key="doc.uuid"
          class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          @click="router.push(`/doctors/${doc.uuid}`)"
        >
          <!-- Header -->
          <div class="relative h-32 bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center overflow-hidden">
            <img v-if="coverImage(doc)" :src="coverImage(doc)" :alt="resolveTranslatedValue(doc.name)" class="absolute inset-0 w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-br from-brand-primary/80 to-brand-primary-dark/80"></div>
            <div class="absolute top-3 right-3 z-10">
              <FavoriteButton :favoritable-id="doc.uuid || doc.id" favoritable-type="staff" :is-favorited="doc.is_favorited" size="sm" @click.stop />
            </div>
            <div class="relative z-10 w-20 h-20 rounded-full border-4 border-white shadow-lg">
              <div class="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                <img
                  v-if="(doc.avatar || doc.profile_image) && !avatarErrors[doc.uuid]"
                  :src="doc.avatar || doc.profile_image"
                  :alt="resolveTranslatedValue(doc.name)"
                  class="w-full h-full object-cover"
                  @error="avatarErrors[doc.uuid] = true"
                />
                <span v-else class="text-2xl font-bold text-brand-primary">{{ getNameInitial(doc.name) }}</span>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 text-center">
            <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-1">
              {{ resolveTranslatedValue(doc.name) }}
            </h3>
            <p v-if="doc.specialization" class="text-xs font-semibold text-brand-primary mt-1">
              {{ resolveTranslatedValue(doc.specialization) }}
            </p>
            <div v-if="doc.primary_facility" class="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400">
              <span class="material-symbols-outlined text-xs">business</span>
              {{ resolveTranslatedValue(doc.primary_facility.name) }}
            </div>
            <p v-if="doc.bio" class="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed line-clamp-2">
              {{ resolveTranslatedValue(doc.bio) }}
            </p>
            <button class="w-full mt-4 py-2.5 border-2 border-brand-primary/20 text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200 cursor-pointer">
              {{ t('doctorsListing.viewProfile') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="store.totalPages > 1 && !store.loading" class="flex justify-center">
        <nav class="flex items-center gap-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 shadow-sm">
          <button class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition" :class="store.pagination.current_page <= 1 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'" :disabled="store.pagination.current_page <= 1" @click="store.setPage(store.pagination.current_page - 1)">
            <span class="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <template v-for="p in store.totalPages" :key="p">
            <button v-if="p === 1 || p === store.totalPages || Math.abs(p - store.pagination.current_page) <= 2" class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition" :class="p === store.pagination.current_page ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/15' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'" @click="store.setPage(p)">{{ p }}</button>
            <span v-else-if="p === store.pagination.current_page - 3 || p === store.pagination.current_page + 3" class="w-9 h-9 flex items-center justify-center text-slate-300 dark:text-slate-600 text-sm">...</span>
          </template>
          <button class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition" :class="store.pagination.current_page >= store.totalPages ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'" :disabled="store.pagination.current_page >= store.totalPages" @click="store.setPage(store.pagination.current_page + 1)">
            <span class="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </nav>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>