<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getPublicStory } from '@/services/publicStoriesService'
import { useCategories } from '@/composables/useCategories'
import { resolveTranslatedValue } from '@/utils/locale'
import CategoryBadge from '@/components/shared/CategoryBadge.vue'
import AppNavbar from '@/components/global/AppNavbar.vue'
import FavoriteButton from '@/components/favorites/FavoriteButton.vue'
import DonateModal from '@/components/story/DonateModal.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const { categories, fetchCategories } = useCategories()
fetchCategories({ type: 'story', per_page: 100 })

const story = ref(null)
const loading = ref(true)
const error = ref(null)
const contentLang = ref('en')
const showDonate = ref(false)

function localField(obj, field) {
  if (!obj || !obj[field]) return ''
  if (typeof obj[field] === 'object') return obj[field][locale.value] || obj[field].en || obj[field].ar || ''
  return obj[field]
}

function formatDate(val) {
  if (!val) return ''
  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return new Date(val.replace(' ', 'T')).toLocaleDateString(loc, { month: 'long', day: 'numeric', year: 'numeric' })
  } catch { return val }
}

function formatCurrency(val) {
  if (val == null) return ''
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return Number(val).toLocaleString(loc, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function progressPercent() {
  if (!story.value?.target_amount || story.value.target_amount <= 0) return 0
  return Math.min(100, ((story.value.collected_amount || 0) / story.value.target_amount) * 100)
}

function patientName() {
  if (!story.value) return ''
  if (story.value.patient?.name) return resolveTranslatedValue(story.value.patient.name)
  return story.value.patient_first_name || ''
}

function storyCategory() {
  const s = story.value
  if (!s) return null
  if (!s.category_id && !s.category) return null
  const catId = s.category_id || s.category?.id || s.category?.uuid
  if (!catId) return null
  return categories.value.find(c => (c.uuid || c.id) == catId) || (s.category || null)
}

function patientAvatar() {
  if (story.value?.patient?.avatar) return story.value.patient.avatar
  return ''
}

async function fetchStory() {
  loading.value = true
  error.value = null
  try {
    const { data } = await getPublicStory(route.params.id)
    story.value = data.data || data
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'not_found'
    } else {
      error.value = err.response?.data?.message || t('stories.errorLoading')
    }
  } finally {
    loading.value = false
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => {
      const el = document.createElement('div')
      el.className = 'fixed top-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg z-50 animate-fade-in'
      el.textContent = t('stories.copied')
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 2000)
    })
}

onMounted(fetchStory)
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <!-- Hero with Cover Image -->
    <div class="relative overflow-hidden pt-28 lg:pt-32 pb-14 lg:pb-20">
      <div v-if="story?.cover_image" class="absolute inset-0">
        <img :src="story.cover_image" class="w-full h-full object-cover" :alt="t('stories.coverImageAlt')" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/40"></div>
      </div>
      <div v-else class="absolute inset-0 hero-gradient">
        <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div>

      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex items-center gap-2 text-sm text-white/60 mb-4" aria-label="Breadcrumb">
          <router-link to="/" class="hover:text-white transition-colors">{{ t('nav.home') }}</router-link>
          <span class="text-white/40">/</span>
          <router-link to="/stories" class="hover:text-white transition-colors">{{ t('nav.stories') }}</router-link>
          <span v-if="story" class="text-white/40">/</span>
          <span v-if="story" class="text-white/80 truncate max-w-[200px]">{{ localField(story, 'title') }}</span>
        </nav>

        <div v-if="loading" class="space-y-4">
          <div class="h-4 w-48 bg-white/10 rounded animate-pulse"></div>
          <div class="h-10 w-3/4 bg-white/10 rounded animate-pulse"></div>
          <div class="h-4 w-64 bg-white/10 rounded animate-pulse"></div>
        </div>

        <template v-else-if="story">
          <div class="flex items-center gap-3 mb-4">
            <span v-if="story.is_fundraising" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-300">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              {{ t('myStories.fundraiser') }}
            </span>
            <CategoryBadge v-if="storyCategory()" :category="storyCategory()" size="sm" />
            <span class="text-sm text-white/60">{{ formatDate(story.created_at) }}</span>
          </div>

          <div class="flex items-center gap-3">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">{{ localField(story, 'title') }}</h1>
            <FavoriteButton :favoritable-id="story.uuid || story.id" favoritable-type="story" :is-favorited="story?.is_favorited" size="lg" />
          </div>
        </template>
      </div>
    </div>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 -mt-6 relative z-10">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse space-y-6">
        <div class="flex gap-4">
          <div class="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
        <div class="space-y-3">
          <div v-for="i in 6" :key="i" class="h-4 bg-slate-200 dark:bg-slate-700 rounded" :class="i % 2 ? 'w-full' : 'w-3/4'"></div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else-if="error === 'not_found'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ t('stories.notFound') }}</h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ t('stories.notFoundDesc') }}</p>
        <router-link to="/stories" class="inline-flex items-center gap-2 mt-6 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition">{{ t('stories.backToStories') }}</router-link>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
        <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('stories.errorLoading') }}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
        <button class="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition cursor-pointer" @click="fetchStory">{{ t('stories.retry') }}</button>
      </div>

      <!-- Story Content -->
      <template v-else-if="story">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Main Content -->
          <div class="flex-1 min-w-0 space-y-6">
            <!-- Patient Info -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
              <div v-if="patientAvatar()" class="w-12 h-12 rounded-full overflow-hidden shrink-0">
                <img :src="patientAvatar()" class="w-full h-full object-cover" alt="" />
              </div>
              <div v-else class="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-lg shrink-0">
                {{ patientName().charAt(0) || '?' }}
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900 dark:text-white">{{ patientName() }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('stories.patientInfo') }}</p>
              </div>
            </div>

            <!-- Language Toggle -->
            <div v-if="story.content?.en && story.content?.ar" class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1 w-fit">
              <button
                class="px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
                :class="contentLang === 'en' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                @click="contentLang = 'en'"
              >{{ t('stories.contentEn') }}</button>
              <button
                class="px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
                :class="contentLang === 'ar' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                @click="contentLang = 'ar'"
              >{{ t('stories.contentAr') }}</button>
            </div>

            <!-- Content Body -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div
                class="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
                :dir="contentLang === 'ar' ? 'rtl' : 'ltr'"
                v-html="story.content?.[contentLang] || ''"
              ></div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="w-full lg:w-80 shrink-0 space-y-6">
            <!-- Fundraising Card -->
            <div v-if="story.is_fundraising && story.target_amount" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4">{{ t('stories.fundraisingGoal') }}</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400">{{ t('stories.raised') }}</span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ formatCurrency(story.collected_amount) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500 dark:text-slate-400">{{ t('stories.goal') }}</span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ formatCurrency(story.target_amount) }}</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    class="h-3 rounded-full bg-brand-primary transition-all duration-700"
                    :style="{ width: progressPercent() + '%' }"
                  ></div>
                </div>
                <p class="text-center text-xs text-slate-500 dark:text-slate-400">
                  {{ Math.round(progressPercent()) }}% {{ t('stories.raised') }}
                </p>
              </div>
              <button
                class="mt-5 w-full rounded-xl bg-brand-primary py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover cursor-pointer flex items-center justify-center gap-2"
                @click="showDonate = true"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {{ t('donations.donate') }}
              </button>
            </div>

            <!-- Share Card -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4">{{ t('stories.share') }}</h3>
              <button
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                @click="copyLink"
              >{{ t('stories.copyLink') }}</button>
            </div>
          </aside>
        </div>
      </template>
    </main>

    <LandingFooter />
  </div>

  <DonateModal :show="showDonate" :story="story" @close="showDonate = false" />
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
