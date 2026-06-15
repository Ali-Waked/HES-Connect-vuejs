<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePublicDoctors } from '../../composables/usePublicDoctors'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import { resolveTranslatedValue, getNameInitial } from '../../utils/locale'

const router = useRouter()
const { t, locale } = useI18n()

const {
  doctors, loading, error, total, filters,
  hasActiveFilters, specializations, facilityTypes, skeletonItems,
  fetchList, handleSearch, setSpecialization, setFacilityType, clearFilters,
} = usePublicDoctors()

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / (doctors.value.length || 1))))
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased text-slate-900 dark:text-slate-100">
    <AppNavbar variant="landing" />

    <div class="relative hero-gradient overflow-hidden pt-28 lg:pt-32 pb-10">
      <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {{ t('doctorsListing.pageTitle') }}
          </h1>
          <p class="mt-2 text-lg text-white/75">{{ t('doctorsListing.pageDescription') }}</p>
        </div>
        <div class="mt-6 flex gap-3">
          <div class="relative flex-1 max-w-xl">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <input
              v-model="filters.search"
              type="text"
              :placeholder="t('doctorsListing.searchPlaceholder')"
              class="w-full pl-11 pr-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30 outline-none transition text-sm"
              @keyup.enter="handleSearch"
            />
            <button
              v-if="filters.search"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
              @click="filters.search = ''; handleSearch()"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <button
            class="bg-white text-brand-primary rounded-xl px-6 py-3 text-sm font-bold hover:bg-brand-primary-light shadow-sm transition cursor-pointer"
            @click="handleSearch"
          >
            {{ t('common.search') }}
          </button>
        </div>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div>
    </div>

    <div class="relative z-10 -mt-3 pb-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center gap-2 py-4">
          <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">{{ t('doctorsListing.specialization') }}</span>
          <button
            v-for="spec in specializations"
            :key="spec"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="filters.specialization === spec
              ? 'bg-brand-primary text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-brand-primary/30 hover:text-brand-primary'"
            @click="setSpecialization(spec)"
          >{{ spec }}</button>
        </div>
        <div class="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-700">
          <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">{{ t('doctorsListing.facilityType') }}</span>
          <button
            v-for="ft in facilityTypes"
            :key="ft.value"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
            :class="filters.facility_id === ft.value
              ? 'bg-brand-primary text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-brand-primary/30 hover:text-brand-primary'"
            @click="setFacilityType(ft.value)"
          >{{ ft.label }}</button>
        </div>
        <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 mt-4">
          <span v-if="filters.search" class="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold">"{{ filters.search }}"</span>
          <span v-if="filters.specialization" class="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold">{{ filters.specialization }}</span>
          <span v-if="filters.facility_id" class="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold">{{ facilityTypes.find(ft => ft.value === filters.facility_id)?.label || filters.facility_id.replace('_', ' ') }}</span>
          <button
            class="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-brand-primary underline underline-offset-2 transition cursor-pointer"
            @click="clearFilters"
          >{{ t('doctorsListing.clearFilters') }}</button>
        </div>
      </div>
    </div>

    <section class="pb-16 lg:pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="!loading" class="flex items-center justify-between mb-6">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ t('doctorsListing.showing') }}
            <span class="font-semibold text-slate-900 dark:text-white">{{ doctors.length }}</span>
            {{ t('common.of') }}
            <span class="font-semibold text-slate-900 dark:text-white">{{ total }}</span>
            {{ t('doctorsListing.results') }}
          </p>
        </div>

        <div v-if="loading" class="grid sm:grid-cols-2 gap-5">
          <div v-for="n in skeletonItems" :key="n" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse overflow-hidden">
            <div class="h-40 bg-slate-200 dark:bg-slate-700"></div>
            <div class="p-5 space-y-3">
              <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div class="flex gap-2 pt-1">
                <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
                <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
              </div>
              <div class="flex gap-3 pt-2">
                <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2"></div>
                <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="doctors.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('doctorsListing.noResultsTitle') }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">{{ t('doctorsListing.noResultsDesc') }}</p>
          <button
            class="btn-primary"
            @click="clearFilters"
          >{{ t('doctorsListing.clearFilters') }}</button>
        </div>

        <div v-else class="grid sm:grid-cols-2 gap-5">
          <div
            v-for="doc in doctors"
            :key="doc.id"
            class="card-base hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
          >
            <div class="h-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
              <img
                v-if="doc.profile_image"
                :src="doc.profile_image"
                :alt="resolveTranslatedValue(doc.name, locale.value)"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-lg">
                <span class="text-3xl font-bold text-white">{{ getNameInitial(doc.name, locale.value) }}</span>
              </div>
            </div>

            <div class="p-5">
              <h3 class="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors truncate">{{ resolveTranslatedValue(doc.name, locale.value) }}</h3>
              <p class="text-sm font-semibold text-brand-primary mt-0.5">{{ resolveTranslatedValue(doc.specialization, locale.value) }}</p>

              <div class="flex items-center gap-2 mt-2 text-xs">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <span class="font-bold text-amber-500">{{ doc.rating }}</span>
                </span>
                <span class="text-slate-300 dark:text-slate-600">·</span>
                <span class="text-slate-500 dark:text-slate-400">{{ t('doctorsListing.experience', { years: doc.experience }) }}</span>
              </div>

              <p v-if="doc.bio" class="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">{{ resolveTranslatedValue(doc.bio, locale.value) }}</p>

              <div class="flex flex-wrap gap-1.5 mt-3">
                <span v-if="doc.primary_facility" class="inline-flex items-center px-2.5 py-1 bg-brand-accent-light dark:bg-brand-accent/20 text-brand-accent dark:text-brand-accent-light rounded-full text-[10px] font-bold">{{ resolveTranslatedValue(doc.primary_facility.name, locale.value) }}</span>
                <span v-if="doc.facilities_count > 1" class="inline-flex items-center px-2.5 py-1 bg-brand-primary-lighter dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary-light rounded-full text-[10px] font-bold">{{ doc.facilities_count }} {{ t('doctorsListing.facilities') }}</span>
                <span v-for="dept in (doc.departments || []).slice(0, 2)" :key="dept.id" class="inline-flex items-center px-2.5 py-1 bg-success-light dark:bg-success/20 text-success dark:text-success-light rounded-full text-[10px] font-bold">{{ resolveTranslatedValue(dept.name, locale.value) }}</span>
                <span v-if="(doc.departments || []).length > 2" class="inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-full text-[10px] font-bold">+{{ doc.departments.length - 2 }}</span>
              </div>

              <div class="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  class="btn-primary flex-1"
                  @click="router.push(`/doctors/${doc.id}`)"
                >{{ t('doctorsListing.viewProfile') }}</button>
                <button
                  class="btn-secondary flex-1"
                  @click="doc.primary_facility && router.push(`/facilities/${doc.primary_facility.id}`)"
                >{{ t('doctorsListing.viewFacilities') }}</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loading && doctors.length > 0 && totalPages > 1" class="mt-10 flex justify-center">
          <nav class="inline-flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-1" aria-label="Pagination">
            <button
              class="px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              :class="'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
              disabled
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
            </button>
            <button
              v-for="p in totalPages"
              :key="p"
              class="min-w-[36px] h-9 rounded-md text-sm font-bold transition cursor-pointer"
              :class="p === 1
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
            >{{ p }}</button>
            <button
              class="px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              :class="'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
              disabled
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </button>
          </nav>
        </div>
      </div>
    </section>

    <LandingFooter />
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
