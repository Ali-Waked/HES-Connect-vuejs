<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '../../composables/useLocaleField'
import { usePublicJobDetail } from '../../composables/usePublicJobDetail'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import FavoriteButton from '../../components/favorites/FavoriteButton.vue'

const props = defineProps({ slug: { type: String, default: '' } })

const router = useRouter()
const { t, locale } = useI18n()
const { localField } = useLocaleField()

const {
  job,
  loading,
  error,
  notFound,
  fetchJob,
} = usePublicJobDetail(props.slug)

watch(() => props.slug, fetchJob, { immediate: true })

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(t('locale') === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

const facilityName = (job) => {
  if (!job) return ''
  const f = job.facility
  return f ? localField(f, 'name') : job.facility_name || ''
}

const isExpiringSoon = () => {
  if (!job.value?.end_date) return false
  const diff = (new Date(job.value.end_date) - new Date()) / 86400000
  return diff < 7 && diff >= 0
}
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
      <!-- Loading -->
      <div v-if="loading" class="space-y-6 animate-pulse">
        <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-32"></div>
          <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-48"></div>
          <div class="space-y-3 pt-6">
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-5/6"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-4/6"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
        </div>
        <p class="text-lg font-semibold text-slate-700 dark:text-slate-300">{{ error }}</p>
        <button @click="fetchJob" class="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 hover:bg-brand-primary-hover transition cursor-pointer">{{ $t('common.retry') }}</button>
      </div>

      <!-- Not Found -->
      <div v-else-if="notFound" class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div class="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504 1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504 1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" /></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ $t('jobs.notFound') || 'Job post not found' }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('jobs.notFoundMessage') || 'This job post may have expired or been removed.' }}</p>
        <router-link to="/jobs" class="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 hover:bg-brand-primary-hover transition">{{ $t('jobs.viewAll') }}</router-link>
      </div>

      <!-- Job Detail -->
      <div v-else-if="job" class="space-y-6 animate-fade-in">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
          <router-link to="/jobs" class="hover:text-brand-primary transition">{{ $t('jobs.title') }}</router-link>
          <svg class="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span class="text-slate-900 dark:text-white truncate max-w-[250px]">{{ localField(job, 'title') }}</span>
        </nav>

        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="p-6 sm:p-8 space-y-6">
            <!-- Header -->
            <div class="space-y-4">
              <div class="flex flex-wrap items-center gap-3">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
                  {{ facilityName(job) }}
                </span>
                <span
                  v-if="isExpiringSoon()"
                  class="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                >
                  {{ $t('jobs.expiringSoon') }}
                </span>
              </div>

              <div class="flex items-start justify-between gap-4">
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight flex-1">
                  {{ localField(job, 'title') }}
                </h1>
                <FavoriteButton :favoritable-id="job.uuid || job.id" favoritable-type="job_post" />
              </div>

              <div class="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 border-t border-slate-100 dark:border-slate-700 mt-6">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ $t('jobs.endDate') }}</span>
                    <span class="text-sm font-bold" :class="isExpiringSoon() ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'">{{ formatDate(job.end_date) }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504 1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504 1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" />
                    </svg>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ $t('jobs.created') }}</span>
                    <span class="text-sm font-bold text-slate-900 dark:text-white">{{ formatDate(job.created_at) }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ $t('jobs.facility') }}</span>
                    <span class="text-sm font-bold text-slate-900 dark:text-white">{{ facilityName(job) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="max-w-none pt-6 border-t border-slate-100 dark:border-slate-700">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{{ $t('jobs.roleDescription') || 'Job Description' }}</h2>
              <div class="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {{ localField(job, 'description') }}
              </div>
            </div>

            <!-- How to Apply -->
            <div class="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                {{ $t('jobs.howToApply') || 'How to Apply' }}
              </h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {{ $t('jobs.applyVia') || 'Please apply via' }} <strong class="text-slate-700 dark:text-slate-300">{{ job.apply_method === 'email' ? $t('common.email') : $t('common.link') }}:</strong>
              </p>
              <a
                v-if="job.apply_method === 'link'"
                :href="job.apply_value"
                target="_blank"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                {{ $t('jobs.applyNow') }}
              </a>
              <div v-else class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ job.apply_value }}</span>
                <button
                  @click="navigator.clipboard?.writeText(job.apply_value)"
                  class="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  {{ $t('common.copy') || 'Copy' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
</style>
