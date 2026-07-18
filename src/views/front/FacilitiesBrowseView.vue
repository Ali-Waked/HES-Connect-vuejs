<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePublicFacilities } from '../../composables/usePublicFacilities'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import { resolveTranslatedValue } from '../../utils/locale'
import FavoriteButton from '@/components/favorites/FavoriteButton.vue'

const router = useRouter()
const { t, locale } = useI18n()

const {
  facilities,
  loading,
  pagination,
  filters,
  hasActiveFilters,
  facilityTypes,
  skeletonItems,
  handleSearch,
  setType,
  handlePageChange,
  clearFilters,
} = usePublicFacilities()

const typeBadge = {
  hospital: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  clinic: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  pharmacy: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  medical_point: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
}

function coverImage(fac) {
  if (fac.cover_image) return fac.cover_image
  if (fac.images?.length) return fac.images[0].url
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
          {{ t('facilitiesListing.pageTitle') }}
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {{ t('facilitiesListing.pageDescription') }}
        </p>
      </div>

      <!-- Search & Type Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4 max-w-3xl mx-auto">
        <div class="relative flex-grow">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            v-model="filters.search"
            type="text"
            :placeholder="t('facilitiesListing.searchPlaceholder')"
            class="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 shadow-sm transition"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- Type Filter Buttons -->
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <button
          v-for="ft in facilityTypes"
          :key="ft.value"
          class="rounded-full px-4 py-2 text-xs font-bold border transition-all cursor-pointer"
          :class="filters.facility_type === ft.value
            ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-primary/40 hover:text-brand-primary bg-white dark:bg-slate-800'"
          @click="setType(ft.value)"
        >
          {{ ft.label }}
        </button>
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="flex justify-center items-center gap-2 mb-6 text-sm">
        <span v-if="filters.search" class="inline-flex items-center gap-1 px-3 py-0.5 text-xs font-bold bg-brand-primary/10 text-brand-primary rounded-full">
          "{{ filters.search }}"
        </span>
        <span v-if="filters.facility_type" class="inline-flex items-center gap-1 px-3 py-0.5 text-xs font-bold bg-brand-primary/10 text-brand-primary rounded-full">
          {{ facilityTypes.find(f => f.value === filters.facility_type)?.label || filters.facility_type }}
        </span>
        <button class="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-primary underline underline-offset-2 cursor-pointer" @click="clearFilters">
          {{ t('facilitiesListing.clearFilters') }}
        </button>
      </div>

      <!-- Results Count -->
      <div v-if="!loading && facilities.length" class="mb-6">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ t('facilitiesListing.showing') }}
          <span class="font-bold text-slate-900 dark:text-white">{{ pagination.from || facilities.length }}</span>
          {{ t('common.of') }}
          <span class="font-bold text-slate-900 dark:text-white">{{ pagination.total }}</span>
          {{ t('facilitiesListing.results') }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div v-else-if="facilities.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-14 h-14 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
          <span class="material-symbols-outlined text-2xl">business</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('facilitiesListing.noResultsTitle') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">{{ t('facilitiesListing.noResultsDesc') }}</p>
        <button class="px-5 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition cursor-pointer" @click="clearFilters">
          {{ t('facilitiesListing.clearFilters') }}
        </button>
      </div>

      <!-- Facilities Grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div
          v-for="fac in facilities"
          :key="fac.uuid"
          class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          @click="router.push(`/facilities/${fac.uuid || fac.id}`)"
        >
          <div class="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-700">
            <img v-if="coverImage(fac)" :src="coverImage(fac)" :alt="resolveTranslatedValue(fac.name)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">business</span>
            </div>
            <div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div class="absolute top-3 right-3 z-10">
              <FavoriteButton :favoritable-id="fac.uuid || fac.id" favoritable-type="facility" :is-favorited="fac.is_favorited" size="sm" @click.stop />
            </div>
            <div class="absolute top-3 left-3 z-10 flex gap-2">
              <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50" :class="typeBadge[fac.facility_type] || 'text-slate-600 dark:text-slate-400'">
                {{ fac.facility_type?.replace('_', ' ') }}
              </span>
              <span v-if="fac.is_featured" class="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-400/90 text-amber-900">
                Featured
              </span>
            </div>
          </div>

          <div class="p-5">
            <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-1">
              {{ resolveTranslatedValue(fac.name) }}
            </h3>
            <p v-if="fac.organization" class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ resolveTranslatedValue(fac.organization.name) }}</p>
            <p v-if="fac.headStaff" class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ t('facilitiesListing.headDoctor') }}: <strong class="text-slate-700 dark:text-slate-300">{{ resolveTranslatedValue(fac.headStaff.name) }}</strong>
            </p>
            <button class="w-full mt-4 py-2.5 border-2 border-brand-primary/20 text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200 cursor-pointer">
              {{ t('facilitiesListing.viewDetails') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1 && !loading" class="flex justify-center">
        <nav class="flex items-center gap-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 shadow-sm">
          <button class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition" :class="pagination.current_page <= 1 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'" :disabled="pagination.current_page <= 1" @click="handlePageChange(pagination.current_page - 1)">
            <span class="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <template v-for="p in pagination.last_page" :key="p">
            <button v-if="p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 2" class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition" :class="p === pagination.current_page ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/15' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'" @click="handlePageChange(p)">{{ p }}</button>
            <span v-else-if="p === pagination.current_page - 3 || p === pagination.current_page + 3" class="w-9 h-9 flex items-center justify-center text-slate-300 dark:text-slate-600 text-sm">...</span>
          </template>
          <button class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition" :class="pagination.current_page >= pagination.last_page ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'" :disabled="pagination.current_page >= pagination.last_page" @click="handlePageChange(pagination.current_page + 1)">
            <span class="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </nav>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
