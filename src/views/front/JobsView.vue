<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '../../composables/useLocaleField'
import { usePublicJobs } from '../../composables/usePublicJobs'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import JobCard from '../../components/jobs/JobCard.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const { localField } = useLocaleField()

const {
  loading,
  jobs,
  pagination,
  filters,
  error,
  fetchJobs,
  setPage,
  updateFilter,
  initFromQuery,
  syncQuery,
} = usePublicJobs()

initFromQuery(route.query)

onMounted(() => {
  fetchJobs()
})

watch(() => route.query, (query) => {
  initFromQuery(query)
  fetchJobs()
})

function onSearchInput(val) {
  updateFilter('search', val)
}

function onSortChange(val) {
  updateFilter('sort', val)
}
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
      <!-- Hero Section -->
      <div class="text-center mb-10">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {{ $t('jobs.title') }}
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {{ $t('jobs.subtitle') || 'Find your next career opportunity in healthcare across Gaza.' }}
        </p>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto">
        <div class="relative flex-grow">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            class="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 shadow-sm transition"
            :placeholder="$t('jobs.searchPlaceholder')"
            :value="filters.search"
            @input="onSearchInput($event.target.value)"
          />
        </div>
        <select
          class="min-w-[160px] p-3 pr-9 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px] shadow-sm transition"
          style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
          :value="filters.sort"
          @change="onSortChange($event.target.value)"
        >
          <option value="latest">{{ $t('common.latest') || 'Latest' }}</option>
          <option value="oldest">{{ $t('common.oldest') || 'Oldest' }}</option>
          <option value="ending_soon">{{ $t('jobs.expiringSoon') }}</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="card-base p-5 animate-pulse space-y-4">
          <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div class="space-y-2">
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          </div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16">
        <div class="w-14 h-14 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-4">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
        </div>
        <p class="text-lg font-semibold text-slate-700 dark:text-slate-300">{{ error }}</p>
        <button @click="fetchJobs" class="mt-4 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 hover:bg-brand-primary-hover transition cursor-pointer">
          {{ $t('common.retry') }}
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="jobs.length === 0" class="text-center py-16">
        <div class="w-14 h-14 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504 1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504 1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" /></svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ $t('jobs.noResults') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('jobs.tryAdjusting') || 'Try adjusting your search or filters.' }}</p>
      </div>

      <!-- Job Cards Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <JobCard v-for="job in jobs" :key="job.id" :job="job" />
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="flex items-center justify-center gap-2">
        <button
          :disabled="pagination.current_page <= 1"
          class="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          @click="setPage(pagination.current_page - 1)"
        >
          {{ $t('common.prev') }}
        </button>
        <template v-for="page in pagination.last_page" :key="page">
          <button
            v-if="Math.abs(page - pagination.current_page) <= 1 || page === 1 || page === pagination.last_page"
            class="w-9 h-9 text-sm font-bold rounded-lg border transition cursor-pointer"
            :class="page === pagination.current_page
              ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'"
            @click="setPage(page)"
          >
            {{ page }}
          </button>
          <span v-else-if="Math.abs(page - pagination.current_page) === 2" class="px-1 text-slate-400">...</span>
        </template>
        <button
          :disabled="pagination.current_page >= pagination.last_page"
          class="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          @click="setPage(pagination.current_page + 1)"
        >
          {{ $t('common.next') }}
        </button>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
