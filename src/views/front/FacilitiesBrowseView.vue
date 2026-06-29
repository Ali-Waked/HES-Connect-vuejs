<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePublicFacilities } from '../../composables/usePublicFacilities'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import { resolveTranslatedValue } from '../../utils/locale'

const router = useRouter()
const { t, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

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

const typeBtnActive = {
  hospital: 'bg-danger text-white border-danger shadow-danger',
  clinic: 'bg-brand-accent text-white border-brand-accent shadow-brand-accent',
  pharmacy: 'bg-success text-white border-success shadow-success',
  medical_point: 'bg-warning text-white border-warning shadow-warning'
}

const typeLabel = computed(() => {
  const found = facilityTypes.find(t => t.value === filters.facility_type)
  return found ? found.label : t('facilitiesListing.allTypes')
})

function coverImage(fac) {
  if (fac.cover_image) return fac.cover_image
  if (fac.images?.length) return fac.images[0].url
  return null
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <div class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-28 pb-20">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-primary/10 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-brand-accent/10 blur-3xl"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">{{ t('facilitiesListing.pageTitle') }}</h1>
          <p class="text-white/60 mt-3 text-base sm:text-lg leading-relaxed">{{ t('facilitiesListing.pageDescription') }}</p>
        </div>

        <div class="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div class="relative flex-1">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <input
              v-model="filters.search"
              type="text"
              :placeholder="t('facilitiesListing.searchPlaceholder')"
              class="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 pl-10 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30 transition"
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
            class="bg-white/15 backdrop-blur-sm text-white rounded-xl px-5 py-3 font-semibold text-sm border border-white/10 hover:bg-white/25 transition-all cursor-pointer"
            @click="handleSearch"
          >
            <svg class="w-4 h-4 sm:mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <span class="hidden sm:inline">{{ t('common.search') }}</span>
          </button>
        </div>

        <div class="flex flex-wrap gap-2 mt-6">
          <button
            v-for="ft in facilityTypes"
            :key="ft.value"
            class="rounded-full px-4 py-1.5 text-xs font-bold border-2 transition-all cursor-pointer backdrop-blur-sm"
            :class="filters.facility_type === ft.value
              ? typeBtnActive[ft.value] + ' shadow-sm'
              : 'border-white/20 text-white/70 hover:border-white/50 hover:text-white'"
            @click="setType(ft.value)"
          >
            {{ ft.label }}
          </button>
        </div>

        <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2 text-sm text-white/70">
          <span v-if="filters.search" class="rounded-full px-3 py-0.5 text-xs font-bold bg-white/15 text-white inline-flex items-center gap-1">
            "{{ filters.search }}"
          </span>
          <span v-if="filters.facility_type" class="rounded-full px-3 py-0.5 text-xs font-bold bg-white/15 text-white inline-flex items-center gap-1">
            {{ typeLabel }}
          </span>
          <button
            class="text-white/60 hover:text-white underline underline-offset-2 text-xs cursor-pointer"
            @click="clearFilters"
          >
            {{ t('facilitiesListing.clearFilters') }}
          </button>
        </div>
      </div>
    </div>

    <section class="relative -mt-8 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="!loading && facilities.length" class="flex items-center justify-between mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ t('facilitiesListing.showing') }}
            <span class="font-semibold text-slate-900 dark:text-white">{{ pagination.from || facilities.length }}</span>
            {{ t('common.of') }}
            <span class="font-semibold text-slate-900 dark:text-white">{{ pagination.total }}</span>
            {{ t('facilitiesListing.results') }}
          </p>
        </div>

        <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="n in skeletonItems" :key="n" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
            <div class="aspect-[16/10] bg-slate-200 dark:bg-slate-700"></div>
            <div class="p-5 space-y-3">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div class="flex gap-2 pt-1">
                <div class="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg w-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="facilities.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('facilitiesListing.noResultsTitle') }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">{{ t('facilitiesListing.noResultsDesc') }}</p>
          <button
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover transition cursor-pointer"
            @click="clearFilters"
          >
            {{ t('facilitiesListing.clearFilters') }}
          </button>
        </div>

        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="fac in facilities"
            :key="fac.uuid"
            class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer"
            @click="router.push(`/facilities/${fac.uuid || fac.id}`)"
          >
            <div class="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-700">
              <img
                v-if="coverImage(fac)"
                :src="coverImage(fac)"
                :alt="resolveTranslatedValue(fac.name)"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-16 h-16 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>

              <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent"></div>

              <div class="absolute top-3 left-3 z-10 flex gap-2">
                <span
                  class="rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-sm backdrop-blur-md bg-white/95 dark:bg-slate-800/95"
                  :class="typeBadge[fac.facility_type] || 'text-slate-700 dark:text-slate-300'"
                >{{ fac.facility_type?.replace('_', ' ') }}</span>
                <span
                  v-if="fac.is_featured"
                  class="rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-sm backdrop-blur-md bg-amber-400/90 text-amber-900 border-amber-300"
                >
                  <svg class="w-3 h-3 inline-block -mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  Featured
                </span>
              </div>
            </div>

            <div class="p-5">
              <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                {{ resolveTranslatedValue(fac.name) }}
              </h3>

              <p v-if="fac.organization" class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {{ resolveTranslatedValue(fac.organization.name) }}
              </p>

              <div v-if="fac.headStaff" class="flex items-center gap-1.5 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <div class="w-5 h-5 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-[9px] font-bold text-brand-primary shrink-0">
                  {{ resolveTranslatedValue(fac.headStaff.name).charAt(0) }}
                </div>
                <span>{{ t('facilitiesListing.headDoctor') }}: <strong class="text-slate-700 dark:text-slate-300">{{ resolveTranslatedValue(fac.headStaff.name) }}</strong></span>
              </div>

              <div class="flex items-center gap-3 mt-3 text-xs text-slate-400 dark:text-slate-500">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {{ new Date(fac.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}
                </span>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  class="w-full py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-primary-hover transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                  {{ t('facilitiesListing.viewDetails') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="pagination.last_page > 1 && !loading" class="mt-10 flex justify-center">
          <nav class="flex items-center gap-1.5" aria-label="Pagination">
            <button
              class="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm transition cursor-pointer"
              :class="pagination.current_page <= 1
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:bg-brand-primary/10 hover:border-brand-primary/30 hover:text-brand-primary bg-white dark:bg-slate-800'"
              :disabled="pagination.current_page <= 1"
              @click="handlePageChange(pagination.current_page - 1)"
            >
              <svg class="w-4 h-4" :class="isRtl ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
            </button>

            <template v-for="p in pagination.last_page" :key="p">
              <button
                v-if="p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 2"
                class="min-w-[36px] h-9 rounded-lg text-sm font-semibold transition cursor-pointer"
                :class="p === pagination.current_page
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-brand-primary/10 hover:text-brand-primary bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'"
                @click="handlePageChange(p)"
              >{{ p }}</button>
              <span
                v-else-if="p === pagination.current_page - 3 || p === pagination.current_page + 3"
                class="text-slate-300 dark:text-slate-600 text-sm px-1"
              >...</span>
            </template>

            <button
              class="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm transition cursor-pointer"
              :class="pagination.current_page >= pagination.last_page
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:bg-brand-primary/10 hover:border-brand-primary/30 hover:text-brand-primary bg-white dark:bg-slate-800'"
              :disabled="pagination.current_page >= pagination.last_page"
              @click="handlePageChange(pagination.current_page + 1)"
            >
              <svg class="w-4 h-4" :class="isRtl ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
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
</style>
