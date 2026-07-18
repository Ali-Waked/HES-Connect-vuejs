<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '../../composables/useLocaleField'

import { useHome } from '../../composables/useHome'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import HeroBackground3D from '../../components/hero/HeroBackground3D.vue'
import HeroMedicalScene from '../../components/hero/HeroMedicalScene.vue'
import FacilityCard from '../../components/home/FacilityCard.vue'
import ArticleCard from '../../components/home/ArticleCard.vue'
import FavoriteButton from '../../components/favorites/FavoriteButton.vue'
import TestimonialsSection from '../../components/testimonials/TestimonialsSection.vue'

const { t } = useI18n()
const { localField } = useLocaleField()
const router = useRouter()

const {
  loading,
  error,
  statistics,
  featuredFacilities,
  facilityCategories,
  latestArticles,
  latestStories,
  latestJobs,
  aboutPreview,
  platformReviews,
  hasData,
  refresh,
} = useHome()

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const searchQuery = ref('')
const locationQuery = ref('')

const statsVisible = ref(false)
const statsSection = ref(null)

let statsObserver = null

onMounted(() => {
  if (statsSection.value) {
    statsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          statsVisible.value = true
          statsObserver?.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    statsObserver.observe(statsSection.value)
  }
})

onBeforeUnmount(() => {
  statsObserver?.disconnect()
})

const statItems = computed(() => [
  { key: 'facilities_count', labelKey: 'statFacilities', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'from-emerald-500 to-teal-600', value: statistics.value?.facilities_count ?? 0 },
  { key: 'doctors_count', labelKey: 'statDoctors', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', color: 'from-blue-500 to-indigo-600', value: statistics.value?.doctors_count ?? 0 },
  { key: 'organizations_count', labelKey: 'statOrganizations', icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21', color: 'from-violet-500 to-purple-600', value: statistics.value?.organizations_count ?? 0 },
  { key: 'articles_count', labelKey: 'statArticles', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', color: 'from-amber-500 to-orange-600', value: statistics.value?.articles_count ?? 0 },
  { key: 'stories_count', labelKey: 'statStories', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'from-rose-500 to-pink-600', value: statistics.value?.stories_count ?? 0 },
  { key: 'jobs_count', labelKey: 'statJobs', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'from-cyan-500 to-sky-600', value: statistics.value?.jobs_count ?? 0 },
])

const categoryIcons = {
  hospital: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  clinic: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  pharmacy: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  medical_point: 'M13 10V3L4 14h7v7l9-11h-7z',
}

function handleSearch() {
  const params = {}
  if (searchQuery.value) params.q = searchQuery.value
  if (locationQuery.value) params.location = locationQuery.value
  router.push({ path: '/facilities', query: params })
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
    <AppNavbar variant="landing" />

    <main>
      <!-- HERO SECTION -->
      <section data-aos="fade-in" data-aos-duration="1000" class="relative min-h-[100dvh] flex items-center bg-slate-900 overflow-hidden">
        <HeroBackground3D />
        <div class="absolute inset-0 dots-pattern opacity-30"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800"></div>
        <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl"></div>
        <div class="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/4 rounded-full blur-3xl"></div>

        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full pt-28 lg:pt-0">
          <div class="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div class="lg:col-span-7 space-y-8 py-12 lg:py-16">
              <div class="space-y-4 animate-fade-in-up">
                <span class="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/15 text-amber-300 text-xs font-semibold rounded-full w-fit tracking-wide border border-amber-400/20">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  {{ t('home.heroBadge') }}
                </span>
                <h1 class="text-[clamp(2rem,5vw,3.75rem)] font-extrabold text-white leading-[1.1] tracking-[-0.02em]">
                  {{ t('home.heroTitlePrefix') }}<br />
                  <span class="text-amber-400 underline decoration-amber-400/30 underline-offset-8 decoration-4">{{ t('home.heroTitleHighlight') }}</span><br />
                  {{ t('home.heroTitleSuffix') }}
                </h1>
                <p class="text-lg text-slate-400 leading-relaxed max-w-lg">
                  {{ t('home.heroDescription') }}
                </p>
              </div>

              <div class="flex flex-col sm:flex-row gap-0 sm:gap-0 w-full max-w-xl animate-fade-in-up rounded-xl overflow-hidden shadow-soft shadow-black/20">
                <div class="relative flex-1">
                  <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                  <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="t('home.searchPlaceholder')"
                    class="w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border-0 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-amber-400/30 outline-none"
                    @keydown.enter="handleSearch"
                  />
                </div>
                <div class="relative flex-1 border-t sm:border-t-0 sm:border-l border-white/5">
                  <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                  </svg>
                  <input
                    v-model="locationQuery"
                    type="text"
                    :placeholder="t('home.locationPlaceholder')"
                    class="w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border-0 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-amber-400/30 outline-none"
                    @keydown.enter="handleSearch"
                  />
                </div>
                <button
                  class="px-6 py-3.5 bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary-hover transition shrink-0 cursor-pointer"
                  @click="handleSearch"
                >
                  {{ t('home.searchButton') }}
                </button>
              </div>

              <div class="flex flex-wrap gap-3 animate-fade-in-up">
                <button
                  class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-sm text-white text-sm font-semibold rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                  @click="router.push('/facilities')"
                >
                  {{ t('home.exploreFacilities') }}
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </button>
                <button
                  class="inline-flex items-center gap-2 px-5 py-2.5 text-slate-400 text-sm font-semibold rounded-lg border border-white/5 hover:text-white hover:border-white/20 transition-all duration-200 cursor-pointer"
                  @click="router.push('/contact')"
                >
                  {{ t('home.contactUs') }}
                </button>
              </div>
            </div>

            <div class="hidden lg:flex lg:col-span-5 justify-center items-center">
              <HeroMedicalScene />
            </div>
          </div>
        </div>
      </section>

      <!-- STATISTICS SECTION -->
      <section
        ref="statsSection"
        data-aos="fade-up"
        data-aos-duration="600"
        class="relative -mt-12 z-20 pb-8"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
              <div class="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4"></div>
              <div class="h-8 bg-slate-100 dark:bg-slate-700 rounded w-20 mb-2"></div>
              <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24"></div>
            </div>
          </div>
          <div v-else-if="statistics" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="(item, idx) in statItems"
              :key="item.key"
              class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
              :style="{ animationDelay: `${idx * 0.1}s` }"
            >
              <div :class="`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon"/>
                </svg>
              </div>
              <p class="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {{ item.value.toLocaleString() }}+
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ t('home.' + item.labelKey) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FACILITY CATEGORIES SECTION -->
      <section data-aos="fade-up" class="py-16 lg:py-20 bg-slate-50 dark:bg-slate-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 animate-fade-in-up">
            <span class="eyebrow-badge mb-4">{{ t('home.categoriesBadge') }}</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{{ t('home.categoriesTitle') }}</h2>
            <p class="text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">{{ t('home.categoriesSubtitle') }}</p>
          </div>

          <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div v-for="n in 4" :key="n" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
              <div class="h-12 w-12 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4"></div>
              <div class="h-5 bg-slate-100 dark:bg-slate-700 rounded w-24 mb-2"></div>
              <div class="h-8 bg-slate-100 dark:bg-slate-700 rounded w-16 mb-3"></div>
              <div class="h-2 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
            </div>
          </div>

          <div v-else-if="facilityCategories.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-500 dark:text-slate-400">{{ t('home.categoriesEmpty') }}</h3>
            <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">{{ t('home.categoriesEmptyHint') }}</p>
          </div>

          <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div
              v-for="(cat, idx) in facilityCategories"
              :key="cat.type"
              class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
              :style="{ animationDelay: `${idx * 0.1}s` }"
              @click="router.push(`/facilities?type=${cat.type}`)"
            >
              <div class="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="categoryIcons[cat.type] || categoryIcons.hospital"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white capitalize mb-1">{{ cat.type.replace(/_/g, ' ') }}</h3>
              <p class="text-3xl font-extrabold text-brand-primary mb-3">{{ cat.count }}</p>
              <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-brand-primary"
                  :style="{ width: Math.min(100, (cat.count / Math.max(...facilityCategories.map(c => c.count))) * 100) + '%' }"
                ></div>
              </div>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">{{ t('home.categoriesCount', { count: cat.count }) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURED FACILITIES SECTION -->
      <section data-aos="fade-up" class="py-16 lg:py-24 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-end justify-between mb-12 animate-fade-in-up">
            <div>
              <span class="eyebrow-badge mb-4">{{ t('home.featuredBadge') }}</span>
              <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{{ t('home.featuredTitle') }}</h2>
              <p class="text-slate-500 dark:text-slate-400 mt-2">{{ t('home.featuredSubtitle') }}</p>
            </div>
            <button class="btn-ghost shrink-0 group/btn" @click="router.push('/facilities')">
              {{ t('home.viewAll') }}
              <svg class="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
          </div>

          <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="n in 3" :key="n" class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
              <div class="h-48 bg-slate-100 dark:bg-slate-800"></div>
              <div class="p-5 space-y-3">
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          </div>

          <div v-else-if="featuredFacilities.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-500 dark:text-slate-400">{{ t('home.featuredEmpty') }}</h3>
            <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">{{ t('home.featuredEmptyHint') }}</p>
          </div>

          <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FacilityCard
              v-for="(fac, idx) in featuredFacilities"
              :key="fac.uuid"
              :facility="fac"
              :style="{ animationDelay: `${idx * 0.1}s` }"
            />
          </div>
        </div>
      </section>

      <!-- LATEST JOBS SECTION -->
      <section data-aos="fade-up" class="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-end justify-between mb-12 animate-fade-in-up">
            <div>
              <span class="eyebrow-badge mb-4">{{ t('home.jobsBadge') }}</span>
              <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{{ t('home.jobsTitle') }}</h2>
              <p class="text-slate-500 dark:text-slate-400 mt-2">{{ t('home.jobsSubtitle') }}</p>
            </div>
            <button class="btn-ghost shrink-0 group/btn" @click="router.push('/jobs')">
              {{ t('home.viewAll') }}
              <svg class="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
          </div>

          <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="n in 4" :key="n" class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
              <div class="p-5 space-y-3">
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
              </div>
            </div>
          </div>

          <div v-else-if="latestJobs.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" d="M20 7l-8-4-8 4m16 0l-8 4m16-10l-8 4m0 10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-500 dark:text-slate-400">{{ t('home.jobsEmpty') }}</h3>
            <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">{{ t('home.jobsEmptyHint') }}</p>
          </div>

          <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="(job, idx) in latestJobs"
              :key="job.uuid"
              class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
              :style="{ animationDelay: `${idx * 0.1}s` }"
              @click="router.push(`/jobs/${job.uuid}`)"
            >
              <div class="relative h-32 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                <img v-if="job.cover_image" :src="job.cover_image" :alt="job.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <span v-if="job.employment_type" class="absolute top-2 left-2 px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-brand-primary text-[10px] font-semibold rounded-md">
                  {{ job.employment_type.replace(/_/g, ' ') }}
                </span>
                <div class="absolute top-2 right-2">
                  <FavoriteButton :favoritable-id="job.uuid || job.id" favoritable-type="job_post" :is-favorited="job.is_favorited" size="sm" @click.stop />
                </div>
              </div>
              <div class="p-4">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug mb-2">
                  {{ job.title }}
                </h3>
                <div class="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div v-if="job.facility" class="flex items-center gap-1.5">
                    <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    <span class="truncate">{{ job.facility.name }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                    <span>{{ job.location || '—' }}</span>
                  </div>
                </div>
                <div v-if="job.published_at" class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 dark:text-slate-500">
                  {{ fmtDate(job.published_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- LATEST STORIES SECTION -->
      <section data-aos="fade-up" class="py-16 lg:py-24 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-end justify-between mb-12 animate-fade-in-up">
            <div>
              <span class="eyebrow-badge mb-4">{{ t('home.storiesBadge') }}</span>
              <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{{ t('home.storiesTitle') }}</h2>
              <p class="text-slate-500 dark:text-slate-400 mt-2">{{ t('home.storiesSubtitle') }}</p>
            </div>
            <button class="btn-ghost shrink-0 group/btn" @click="router.push('/stories')">
              {{ t('home.viewAll') }}
              <svg class="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
          </div>

          <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="n in 4" :key="n" class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
              <div class="h-44 bg-slate-100 dark:bg-slate-800"></div>
              <div class="p-5 space-y-3">
                <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div v-else-if="latestStories.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-500 dark:text-slate-400">{{ t('home.storiesEmpty') }}</h3>
            <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">{{ t('home.storiesEmptyHint') }}</p>
          </div>

          <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="(story, idx) in latestStories"
              :key="story.uuid"
              class="group card-hover overflow-hidden cursor-pointer animate-fade-in-up"
              :style="{ animationDelay: `${idx * 0.1}s` }"
              @click="router.push(`/stories/${story.uuid}`)"
            >
              <div class="relative h-44 overflow-hidden bg-gradient-to-br from-rose-500/10 to-pink-500/30">
                <img
                  v-if="story.cover_image"
                  :src="story.cover_image"
                  :alt="story.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-16 h-16 text-rose-500/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <div v-if="story.is_fundraising" class="absolute top-3 left-3">
                  <span class="px-2.5 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-md">
                    {{ t('stories.fundraisingOnly') }}
                  </span>
                </div>
                <div v-if="story.category" class="absolute top-3 right-3">
                  <span class="px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold rounded-md">
                    {{ localField(story.category, 'name') }}
                  </span>
                </div>
                <div class="absolute bottom-3 right-3">
                  <FavoriteButton :favoritable-id="story.uuid || story.id" favoritable-type="story" :is-favorited="story.is_favorited" size="sm" @click.stop />
                </div>
              </div>
              <div class="p-5">
                <div v-if="story.patient" class="flex items-center gap-2 mb-3">
                  <div class="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-[10px] font-bold">
                    {{ story.patient.name?.charAt(0) || '?' }}
                  </div>
                  <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('stories.byPatient', { name: story.patient.name }) }}</span>
                </div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors line-clamp-2 leading-snug">
                  {{ story.title }}
                </h3>
                <div class="mt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span class="inline-flex items-center gap-1 text-rose-500 font-semibold group-hover:gap-1.5 transition-all">
                    {{ t('stories.readMore') }}
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- LATEST ARTICLES SECTION -->
      <section data-aos="fade-up" class="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-end justify-between mb-12 animate-fade-in-up">
            <div>
              <span class="eyebrow-badge mb-4">{{ t('home.latestBadge') }}</span>
              <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{{ t('home.articlesTitle') }}</h2>
              <p class="text-slate-500 dark:text-slate-400 mt-2">{{ t('home.articlesSubtitle') }}</p>
            </div>
            <button class="btn-ghost shrink-0 group/btn" @click="router.push('/articles')">
              {{ t('home.viewAll') }}
              <svg class="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
          </div>

          <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="n in 4" :key="n" class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
              <div class="h-44 bg-slate-100 dark:bg-slate-800"></div>
              <div class="p-5 space-y-3">
                <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div v-else-if="latestArticles.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-500 dark:text-slate-400">{{ t('home.articlesEmpty') }}</h3>
            <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">{{ t('home.articlesEmptyHint') }}</p>
          </div>

          <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ArticleCard
              v-for="(article, idx) in latestArticles"
              :key="article.uuid"
              :article="article"
              :style="{ animationDelay: `${idx * 0.1}s` }"
            />
          </div>
        </div>
      </section>

      <!-- ABOUT PREVIEW SECTION -->
      <section data-aos="fade-up" class="py-16 lg:py-24 bg-white dark:bg-slate-950 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div v-if="loading" class="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <div class="lg:col-span-3 space-y-6">
              <div class="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"></div>
              <div class="h-10 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
              <div class="space-y-3">
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse"></div>
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse"></div>
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3 animate-pulse"></div>
              </div>
              <div class="h-10 w-40 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            </div>
            <div class="lg:col-span-2">
              <div class="grid grid-cols-2 gap-4">
                <div v-for="n in 4" :key="n" class="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>

          <div v-else-if="!aboutPreview" class="empty-state">
            <div class="empty-state-icon">
              <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-500 dark:text-slate-400">{{ t('home.aboutEmpty') }}</h3>
            <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">{{ t('home.aboutEmptyHint') }}</p>
          </div>

          <div v-else class="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            <div class="lg:col-span-3 space-y-6 animate-fade-in-up">
              <span class="eyebrow-badge">{{ t('home.aboutBadge') }}</span>
              <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                {{ aboutPreview.title }}
              </h2>
              <p class="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">
                {{ aboutPreview.excerpt }}
              </p>
              <button class="btn-primary" @click="router.push('/about')">
                {{ t('home.learnMore') }}
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                </svg>
              </button>
            </div>

            <div class="lg:col-span-2 animate-fade-in-up" style="animation-delay: 0.2s">
              <div class="grid grid-cols-2 gap-4">
                <div
                  v-for="(item, idx) in statItems"
                  :key="item.key"
                  class="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 lg:p-6 text-center hover:shadow-soft transition-all duration-300"
                >
                  <p class="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">{{ item.value.toLocaleString() }}+</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">{{ t('home.' + item.labelKey) }}</p>
                  <div class="w-full h-1 rounded-full bg-slate-50 dark:bg-slate-800 mt-3 overflow-hidden">
                    <div :class="`h-full rounded-full w-2/3 bg-gradient-to-r ${item.color}`"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PLATFORM REVIEWS SECTION -->
      <TestimonialsSection :reviews="platformReviews" :loading="loading" />

      <!-- ERROR STATE (shown when no data and error) -->
      <div v-if="error && !hasData && !loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-500 dark:text-slate-400">{{ t('home.errorTitle') }}</h3>
          <p class="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-md mx-auto">{{ error }}</p>
          <button class="btn-primary mt-6" @click="refresh">
            {{ t('home.tryAgain') }}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"/>
            </svg>
          </button>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
