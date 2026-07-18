<script setup>
import { watch, computed } from 'vue'
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

function formatSalary(salary) {
  if (!salary) return ''
  const from = salary.from?.toLocaleString() || ''
  const to = salary.to?.toLocaleString() || ''
  if (from && to) return `${from} – ${to} ${salary.currency || ''}`
  if (from) return `${from} ${salary.currency || ''}`
  if (to) return `Up to ${to} ${salary.currency || ''}`
  return ''
}

const facilityName = computed(() => {
  if (!job.value) return ''
  const f = job.value.facility
  return f ? localField(f, 'name') : job.value.facility_name || ''
})

const facilityInitial = computed(() => (facilityName.value || '?').charAt(0).toUpperCase())

const isExpiringSoon = computed(() => {
  if (!job.value?.end_date) return false
  const diff = (new Date(job.value.end_date) - new Date()) / 86400000
  return diff < 7 && diff >= 0
})

const daysLeft = computed(() => {
  if (!job.value?.end_date) return null
  const diff = Math.ceil((new Date(job.value.end_date) - new Date()) / 86400000)
  return diff >= 0 ? diff : 0
})

const employmentLabel = computed(() => {
  if (!job.value?.employment_type) return ''
  return job.value.employment_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
})

const experienceLabel = computed(() => {
  if (!job.value?.experience_level) return ''
  return job.value.experience_level.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
})

function copyEmail() {
  navigator.clipboard?.writeText(job.value?.apply_value || '')
}

function applyHref() {
  if (!job.value) return '#'
  return job.value.apply_method === 'email'
    ? `mailto:${job.value.apply_value}`
    : job.value.apply_value
}
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">

      <!-- Loading -->
      <div v-if="loading" class="space-y-6 animate-pulse">
        <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
        <div class="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">
          <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4"></div>
          <div class="flex gap-3">
            <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
            <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
          </div>
          <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
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
        <nav class="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <router-link to="/jobs" class="hover:text-brand-primary transition">{{ $t('jobs.title') }}</router-link>
          <svg class="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span class="text-slate-900 dark:text-white truncate max-w-[250px]">{{ localField(job, 'title') }}</span>
        </nav>

        <!-- Cover Image -->
        <div v-if="job.cover_image" class="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
          <img :src="job.cover_image" :alt="localField(job, 'title')" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
          <div class="absolute top-4 right-4">
            <FavoriteButton :favoritable-id="job.uuid || job.id" favoritable-type="job_post" :is-favorited="job?.is_favorited" />
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div class="flex items-center gap-2 mb-3">
              <span v-if="job.featured" class="px-2.5 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-bold rounded-md uppercase tracking-wider">Featured</span>
              <span v-if="isExpiringSoon" class="px-2.5 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wider">Expiring Soon</span>
            </div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">{{ localField(job, 'title') }}</h1>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Cover placeholder if no image -->
            <div v-if="!job.cover_image" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span v-if="job.featured" class="px-2.5 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-bold rounded-md uppercase tracking-wider">Featured</span>
                  <span v-if="isExpiringSoon" class="px-2.5 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 text-[10px] font-bold rounded-md uppercase tracking-wider">Expiring Soon</span>
                  <span v-if="employmentLabel" class="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase tracking-wider">{{ employmentLabel }}</span>
                  <span v-if="experienceLabel" class="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase tracking-wider">{{ experienceLabel }}</span>
                </div>
                <FavoriteButton :favoritable-id="job.uuid || job.id" favoritable-type="job_post" :is-favorited="job?.is_favorited" />
              </div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{{ localField(job, 'title') }}</h1>
            </div>

            <!-- Quick Info Row (only if no cover image) -->
            <div v-if="!job.cover_image" class="flex flex-wrap items-center gap-3">
              <span v-if="employmentLabel" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">{{ employmentLabel }}</span>
              <span v-if="experienceLabel" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">{{ experienceLabel }}</span>
              <span v-if="job.location" class="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                {{ job.location }}
              </span>
              <span v-if="job.category && localField(job.category, 'name')" class="px-3 py-1.5 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-lg">{{ localField(job.category, 'name') }}</span>
            </div>

            <!-- Tags under cover -->
            <div v-if="job.cover_image" class="flex flex-wrap items-center gap-3">
              <span v-if="employmentLabel" class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">{{ employmentLabel }}</span>
              <span v-if="experienceLabel" class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">{{ experienceLabel }}</span>
              <span v-if="job.location" class="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                {{ job.location }}
              </span>
              <span v-if="job.category && localField(job.category, 'name')" class="px-3 py-1.5 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-lg">{{ localField(job.category, 'name') }}</span>
            </div>

            <!-- Description -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-brand-primary text-xl">description</span>
                {{ $t('jobs.roleDescription') || 'Job Description' }}
              </h2>
              <div class="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap text-sm">{{ localField(job, 'description') }}</div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Apply Card -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4">{{ $t('jobs.howToApply') || 'How to Apply' }}</h3>
              <a
                :href="applyHref()"
                :target="job.apply_method === 'link' ? '_blank' : ''"
                class="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-xl shadow-md shadow-brand-primary/15 transition cursor-pointer"
              >
                <svg v-if="job.apply_method === 'email'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                {{ job.apply_method === 'email' ? 'Send Email' : 'Apply Now' }}
              </a>
              <div v-if="job.apply_method === 'email'" class="mt-3 flex items-center gap-2">
                <span class="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">{{ job.apply_value }}</span>
                <button @click="copyEmail" class="shrink-0 px-3 py-1.5 text-[11px] font-bold border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer">
                  {{ $t('common.copy') }}
                </button>
              </div>
            </div>

            <!-- Job Details Card -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Job Details</h3>

              <!-- Facility -->
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm shrink-0">{{ facilityInitial }}</div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Facility</p>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ facilityName }}</p>
                </div>
              </div>

              <!-- Category -->
              <div v-if="job.category && localField(job.category, 'name')" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" d="M6 6h.008v.008H6V6z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</p>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ localField(job.category, 'name') }}</p>
                </div>
              </div>

              <!-- Location -->
              <div v-if="job.location" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Location</p>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ job.location }}</p>
                </div>
              </div>

              <!-- Salary -->
              <div v-if="job.salary_visible && formatSalary(job.salary)" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Salary</p>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatSalary(job.salary) }}</p>
                </div>
              </div>

              <!-- Vacancies -->
              <div v-if="job.vacancies" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Vacancies</p>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ job.vacancies }}</p>
                </div>
              </div>

              <hr class="border-slate-100 dark:border-slate-700" />

              <!-- Dates -->
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400">Published</span>
                  <span class="font-semibold text-slate-900 dark:text-white">{{ formatDate(job.published_at) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400">Deadline</span>
                  <span class="font-semibold" :class="isExpiringSoon ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'">
                    {{ formatDate(job.end_date) }}
                    <span v-if="daysLeft !== null && daysLeft >= 0" class="text-xs font-normal ml-1">({{ daysLeft }} days left)</span>
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400">Views</span>
                  <span class="font-semibold text-slate-900 dark:text-white">{{ job.views || 0 }}</span>
                </div>
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
