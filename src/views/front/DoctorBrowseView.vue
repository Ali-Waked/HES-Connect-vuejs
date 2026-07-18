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
  specializations, facilityTypes,
  fetchList, handleSearch, setSpecialization, setFacilityType, clearFilters,
} = usePublicDoctors()

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / (doctors.value.length || 1))))
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
      <!-- Hero Section -->
      <div class="text-center mb-10">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {{ t('doctorsListing.pageTitle') }}
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {{ t('doctorsListing.pageDescription') }}
        </p>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6 max-w-3xl mx-auto">
        <div class="relative flex-grow">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="filters.search"
            type="text"
            class="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 shadow-sm transition"
            :placeholder="t('doctorsListing.searchPlaceholder')"
            @keyup.enter="handleSearch"
          />
        </div>
        <select
          v-model="filters.specialization"
          class="min-w-[160px] p-3 pr-9 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px] shadow-sm transition"
          style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
          @change="setSpecialization($event.target.value)"
        >
          <option value="">{{ t('doctorsListing.allSpecializations') || 'All Specializations' }}</option>
          <option v-for="spec in specializations" :key="spec" :value="spec">{{ spec }}</option>
        </select>
        <select
          v-model="filters.facility_id"
          class="min-w-[160px] p-3 pr-9 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px] shadow-sm transition"
          style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
          @change="setFacilityType($event.target.value)"
        >
          <option value="">{{ t('doctorsListing.allFacilities') || 'All Facilities' }}</option>
          <option v-for="ft in facilityTypes" :key="ft.value" :value="ft.value">{{ ft.label }}</option>
        </select>
      </div>

      <!-- Active Filters -->
      <div v-if="filters.search || filters.specialization || filters.facility_id" class="flex flex-wrap items-center gap-2 mb-8 max-w-3xl mx-auto">
        <span v-if="filters.search" class="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold">
          "{{ filters.search }}"
        </span>
        <span v-if="filters.specialization" class="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold">
          {{ filters.specialization }}
        </span>
        <span v-if="filters.facility_id" class="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold">
          {{ facilityTypes.find(ft => ft.value === filters.facility_id)?.label || filters.facility_id }}
        </span>
        <button
          class="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-brand-primary underline underline-offset-2 transition cursor-pointer"
          @click="clearFilters"
        >{{ t('doctorsListing.clearFilters') }}</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
          <div class="aspect-[4/3] bg-slate-200 dark:bg-slate-700"></div>
          <div class="p-5 space-y-3">
            <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
        </div>
        <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('doctorsListing.noResultsTitle') }}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
        <button class="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition cursor-pointer" @click="fetchList">
          {{ t('common.retry') || 'Retry' }}
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="doctors.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('doctorsListing.noResultsTitle') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('doctorsListing.noResultsDesc') }}</p>
        <button class="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="clearFilters">
          {{ t('doctorsListing.clearFilters') }}
        </button>
      </div>

      <!-- Doctor Cards Grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="doc in doctors"
          :key="doc.id"
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
          @click="router.push(`/doctors/${doc.id}`)"
        >
          <!-- Image -->
          <div class="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700 relative">
            <img
              v-if="doc.profile_image"
              :src="doc.profile_image"
              :alt="resolveTranslatedValue(doc.name, locale)"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/40 flex items-center justify-center">
              <span class="text-4xl font-bold text-white/60">{{ getNameInitial(doc.name, locale) }}</span>
            </div>

            <!-- Rating -->
            <div v-if="doc.rating" class="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-800/90 shadow-sm backdrop-blur-sm">
              <svg class="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <span class="text-slate-700 dark:text-slate-300">{{ doc.rating }}</span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 space-y-3">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-brand-primary transition-colors">
                {{ resolveTranslatedValue(doc.name, locale) }}
              </h3>
              <p class="text-sm font-semibold text-brand-primary mt-0.5">
                {{ resolveTranslatedValue(doc.specialization, locale) }}
              </p>
            </div>

            <p v-if="doc.bio" class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {{ resolveTranslatedValue(doc.bio, locale) }}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5">
              <span v-if="doc.primary_facility" class="inline-flex items-center px-2 py-0.5 bg-brand-accent-light dark:bg-brand-accent/20 text-brand-accent dark:text-brand-accent-light rounded-full text-[10px] font-bold">
                {{ resolveTranslatedValue(doc.primary_facility.name, locale) }}
              </span>
              <span v-for="dept in (doc.departments || []).slice(0, 2)" :key="dept.id" class="inline-flex items-center px-2 py-0.5 bg-success-light dark:bg-success/20 text-success dark:text-success-light rounded-full text-[10px] font-bold">
                {{ resolveTranslatedValue(dept.name, locale) }}
              </span>
              <span v-if="(doc.departments || []).length > 2" class="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-full text-[10px] font-bold">
                +{{ doc.departments.length - 2 }}
              </span>
            </div>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {{ t('doctorsListing.experience', { years: doc.experience }) }}
              </span>
              <span class="text-xs font-semibold text-brand-primary group-hover:underline flex items-center gap-1">
                {{ t('doctorsListing.viewProfile') }}
                <svg class="w-3 h-3 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && doctors.length > 0 && totalPages > 1" class="flex items-center justify-center gap-2 mt-10">
        <button
          class="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          disabled
        >
          {{ t('common.previous') || 'Prev' }}
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          class="w-9 h-9 text-sm font-bold rounded-lg border transition cursor-pointer"
          :class="p === 1
            ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'"
        >{{ p }}</button>
        <button
          class="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          disabled
        >
          {{ t('common.next') || 'Next' }}
        </button>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
