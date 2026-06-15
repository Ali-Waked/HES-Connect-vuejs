<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePublicFacilities } from '../../composables/usePublicFacilities'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import { resolveTranslatedValue } from '../../utils/locale'

const router = useRouter()
const { t } = useI18n()

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
  hospital: 'bg-danger-light text-danger border-danger/20 dark:bg-danger/20 dark:text-danger-light',
  clinic: 'bg-brand-accent-light text-brand-accent border-brand-accent/20 dark:bg-brand-accent/20 dark:text-brand-accent-light',
  pharmacy: 'bg-success-light text-success border-success/20 dark:bg-success/20 dark:text-success-light',
  medical_point: 'bg-warning-light text-warning border-warning/20 dark:bg-warning/20 dark:text-warning-light'
}

const typeActive = {
  hospital: 'bg-danger text-white border-danger',
  clinic: 'bg-brand-accent text-white border-brand-accent',
  pharmacy: 'bg-success text-white border-success',
  medical_point: 'bg-warning text-white border-warning'
}

const typeLabel = computed(() => {
  const found = facilityTypes.find(t => t.value === filters.facility_type)
  return found ? found.label : t('facilitiesListing.allTypes')
})
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <div class="relative hero-gradient overflow-hidden pt-28 pb-16">
      <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">{{ t('facilitiesListing.pageTitle') }}</h1>
        <p class="text-white/75 mt-2 max-w-xl text-base sm:text-lg">{{ t('facilitiesListing.pageDescription') }}</p>

        <div class="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div class="relative flex-1">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <input
              v-model="filters.search"
              type="text"
              :placeholder="t('facilitiesListing.searchPlaceholder')"
              class="w-full rounded-xl border border-white/20 bg-white/15 backdrop-blur-sm px-4 py-2.5 pl-10 text-sm text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30 transition"
              @keyup.enter="handleSearch"
            />
            <button
              v-if="filters.search"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white cursor-pointer"
              @click="filters.search = ''; handleSearch()"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <button
            class="bg-white text-brand-primary rounded-xl px-5 py-2.5 font-bold text-sm shadow-sm hover:bg-brand-primary-light transition-all cursor-pointer"
            @click="handleSearch"
          >
            <svg class="w-4 h-4 sm:mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <span class="hidden sm:inline">{{ t('common.search') }}</span>
          </button>
        </div>

        <div class="flex flex-wrap gap-2 mt-5">
          <button
            v-for="ft in facilityTypes"
            :key="ft.value"
            class="rounded-full px-3.5 py-1.5 text-xs font-bold border-2 transition-all cursor-pointer backdrop-blur-sm"
            :class="filters.facility_type === ft.value
              ? typeActive[ft.value] + ' shadow-sm'
              : 'border-white/30 text-white/80 hover:border-white/60 hover:text-white'"
            @click="setType(ft.value)"
          >
            {{ ft.label }}
          </button>
        </div>

        <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2 text-sm text-white/70">
          <span v-if="filters.search" class="rounded-full px-3 py-0.5 text-xs font-bold bg-white/20 text-white inline-flex items-center gap-1">
            "{{ filters.search }}"
          </span>
          <span v-if="filters.facility_type" class="rounded-full px-3 py-0.5 text-xs font-bold bg-white/20 text-white inline-flex items-center gap-1">
            {{ typeLabel }}
          </span>
          <button
            class="text-white/80 hover:text-white underline underline-offset-2 text-xs cursor-pointer"
            @click="clearFilters"
          >
            {{ t('facilitiesListing.clearFilters') }}
          </button>
        </div>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div>
    </div>

    <section class="relative z-10 -mt-6 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="!loading" class="card-base flex items-center justify-between mb-6 px-4 py-2.5">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ t('facilitiesListing.showing') }}
            <span class="font-semibold text-slate-900 dark:text-white">{{ facilities.length }}</span>
            {{ t('common.of') }}
            <span class="font-semibold text-slate-900 dark:text-white">{{ pagination.total }}</span>
            {{ t('facilitiesListing.results') }}
          </p>
        </div>

        <div v-if="loading" class="grid sm:grid-cols-2 gap-6">
          <div v-for="n in skeletonItems" :key="n" class="card-base overflow-hidden animate-pulse">
            <div class="aspect-[16/9] bg-slate-200 dark:bg-slate-700"></div>
            <div class="p-4 space-y-2.5">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div class="flex gap-3">
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
              </div>
              <div class="flex gap-2 pt-1">
                <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2"></div>
                <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="facilities.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('facilitiesListing.noResultsTitle') }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">{{ t('facilitiesListing.noResultsDesc') }}</p>
          <button
            class="btn-primary"
            @click="clearFilters"
          >
            {{ t('facilitiesListing.clearFilters') }}
          </button>
        </div>

        <div v-else class="grid sm:grid-cols-2 gap-6">
          <div
            v-for="fac in facilities"
            :key="fac.id"
            class="group card-base hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <div class="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-700">
              <img
                v-if="fac.image"
                :src="fac.image"
                :alt="resolveTranslatedValue(fac.name)"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>

              <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent"></div>

              <div class="absolute top-3 left-3 z-10">
                <span
                  class="rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-sm backdrop-blur-md"
                  :class="typeBadge[fac.facility_type] || 'bg-white/90 text-slate-700'"
                >{{ fac.facility_type?.replace('_', ' ') }}</span>
              </div>

              <div class="absolute bottom-3 right-3 z-10 bg-white/95 dark:bg-slate-800/95 px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1 backdrop-blur-sm">
                <svg class="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ fac.rating }}</span>
                <span class="text-xs text-slate-400 dark:text-slate-500">({{ fac.review_count }})</span>
              </div>
            </div>

            <div class="p-4">
              <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                {{ resolveTranslatedValue(fac.name) }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{{ fac.organization_name }}</p>

              <div class="flex items-center gap-1 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                {{ fac.city }}
              </div>

              <div class="flex gap-3 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{{ fac.doctor_count || 0 }} {{ t('facilitiesListing.doctors') }}</span>
                <span class="text-slate-300 dark:text-slate-600">|</span>
                <span>{{ fac.department_count || 0 }} {{ t('facilitiesListing.departments') }}</span>
                <span class="text-slate-300 dark:text-slate-600">|</span>
                <span>{{ fac.review_count }} {{ t('facilitiesListing.reviews') }}</span>
              </div>

              <p v-if="resolveTranslatedValue(fac.description)" class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-2.5">
                {{ resolveTranslatedValue(fac.description) }}
              </p>

              <div v-if="fac.head_doctor" class="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div class="w-5 h-5 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-[9px] font-bold text-brand-primary shrink-0">
                  {{ resolveTranslatedValue(fac.head_doctor).charAt(0) }}
                </div>
                <span>{{ t('facilitiesListing.headDoctor') }}: <strong class="text-slate-700 dark:text-slate-300">{{ resolveTranslatedValue(fac.head_doctor) }}</strong></span>
              </div>

              <div class="flex gap-2 mt-3">
                <button
                  class="btn-primary flex-1 py-2 text-xs"
                  @click="router.push(`/facilities/${fac.id}`)"
                >
                  <svg class="w-3.5 h-3.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                  {{ t('facilitiesListing.viewDetails') }}
                </button>
                <button
                  class="btn-secondary flex-1 py-2 text-xs"
                  @click="router.push({ name: 'public-doctors', query: { facility: fac.id } })"
                >
                  <svg class="w-3.5 h-3.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                  {{ t('facilitiesListing.viewDoctors') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="pagination.last_page > 1 && !loading" class="mt-8 flex justify-center">
          <nav class="flex items-center gap-1" aria-label="Pagination">
            <button
              class="pagination-btn px-2 py-1.5"
              :class="pagination.current_page <= 1
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'pagination-btn-inactive'"
              :disabled="pagination.current_page <= 1"
              @click="handlePageChange(pagination.current_page - 1)"
            >
              <svg class="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
            </button>

            <template v-for="p in pagination.last_page" :key="p">
              <button
                v-if="p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 2"
                class="pagination-btn"
                :class="p === pagination.current_page
                  ? 'pagination-btn-active'
                  : 'pagination-btn-inactive'"
                @click="handlePageChange(p)"
              >{{ p }}</button>
              <span
                v-else-if="p === pagination.current_page - 3 || p === pagination.current_page + 3"
                class="text-slate-300 dark:text-slate-600 text-sm px-0.5"
              >...</span>
            </template>

            <button
              class="pagination-btn px-2 py-1.5"
              :class="pagination.current_page >= pagination.last_page
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'pagination-btn-inactive'"
              :disabled="pagination.current_page >= pagination.last_page"
              @click="handlePageChange(pagination.current_page + 1)"
            >
              <svg class="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </button>
          </nav>
        </div>
      </div>
    </section>

    <LandingFooter />
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
