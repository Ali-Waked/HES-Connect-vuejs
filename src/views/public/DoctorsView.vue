<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDoctorsStore } from '@/stores/useDoctorsStore'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import DoctorCard from '@/components/public/doctors/DoctorCard.vue'
import DoctorFilters from '@/components/public/doctors/DoctorFilters.vue'
import DoctorSkeleton from '@/components/public/doctors/DoctorSkeleton.vue'

const router = useRouter()
const { t } = useI18n()

const store = useDoctorsStore()
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <div class="relative hero-gradient overflow-hidden pt-28 pb-16">
      <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {{ t('doctorsListing.pageTitle') }}
        </h1>
        <p class="text-white/75 mt-2 max-w-xl text-base sm:text-lg">
          {{ t('doctorsListing.pageDescription') }}
        </p>

        <div class="mt-6">
          <DoctorFilters
            v-model="store.filters.search"
            :facility-type="store.filters.facility_type"
            :facility-types="store.facilityTypes"
            @update:facility-type="store.setFacilityType"
            @search="store.setSearch(store.filters.search)"
            @clear="store.clearFilters"
          />
        </div>
      </div>
    </div>

    <section class="relative z-10 -mt-6 pb-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="!store.loading && !store.error" class="card-base flex items-center justify-between mb-6 px-4 py-2.5">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ t('doctorsListing.showing') }}
            <span class="font-semibold text-slate-900 dark:text-white">{{ store.doctors.length }}</span>
            {{ t('common.of') }}
            <span class="font-semibold text-slate-900 dark:text-white">{{ store.pagination.total }}</span>
            {{ t('doctorsListing.results') }}
          </p>
        </div>

        <div v-if="store.loading">
          <DoctorSkeleton :count="6" />
        </div>

        <div v-else-if="store.error" class="empty-state">
          <div class="empty-state-icon">
            <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('common.error') }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">{{ store.error }}</p>
          <button
            class="btn-primary"
            @click="store.fetchDoctors"
          >
            {{ t('common.retry') }}
          </button>
        </div>

        <div v-else-if="store.doctors.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('doctorsListing.noResultsTitle') }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">{{ t('doctorsListing.noResultsDesc') }}</p>
          <button
            class="btn-primary"
            @click="store.clearFilters"
          >
            {{ t('doctorsListing.clearFilters') }}
          </button>
        </div>

        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DoctorCard
            v-for="doc in store.doctors"
            :key="doc.uuid"
            :doctor="doc"
          />
        </div>

        <div v-if="store.totalPages > 1 && !store.loading" class="mt-8 flex justify-center">
          <nav class="flex items-center gap-1" aria-label="Pagination">
            <button
              class="pagination-btn px-2 py-1.5"
              :class="store.pagination.current_page <= 1
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'pagination-btn-inactive'"
              :disabled="store.pagination.current_page <= 1"
              @click="store.setPage(store.pagination.current_page - 1)"
            >
              <svg class="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
            </button>

            <template v-for="p in store.totalPages" :key="p">
              <button
                v-if="p === 1 || p === store.totalPages || Math.abs(p - store.pagination.current_page) <= 2"
                class="pagination-btn"
                :class="p === store.pagination.current_page
                  ? 'pagination-btn-active'
                  : 'pagination-btn-inactive'"
                @click="store.setPage(p)"
              >{{ p }}</button>
              <span
                v-else-if="p === store.pagination.current_page - 3 || p === store.pagination.current_page + 3"
                class="text-slate-300 dark:text-slate-600 text-sm px-0.5"
              >...</span>
            </template>

            <button
              class="pagination-btn px-2 py-1.5"
              :class="store.pagination.current_page >= store.totalPages
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'pagination-btn-inactive'"
              :disabled="store.pagination.current_page >= store.totalPages"
              @click="store.setPage(store.pagination.current_page + 1)"
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
