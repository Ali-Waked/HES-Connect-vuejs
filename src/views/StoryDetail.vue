<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
const notFound = ref(false)
const contentLang = computed(() => locale.value === 'ar' ? 'ar' : 'en')
const showDonate = ref(false)

function localField(obj, field) {
  if (!obj || !obj[field]) return ''
  if (typeof obj[field] === 'object') return obj[field][locale.value] || obj[field].en || obj[field].ar || ''
  return obj[field]
}

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val.replace(' ', 'T'))
  if (isNaN(d.getTime())) return val
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return d.toLocaleDateString(loc, { month: 'long', day: 'numeric', year: 'numeric' })
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

const goalReached = computed(() => {
  return (story.value?.collected_amount || 0) >= (story.value?.target_amount || 0)
})

const overlayRgb = ref(null)

function extractImageColor(imgSrc) {
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 40
    canvas.height = 40
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, 40, 40)
    const pixels = ctx.getImageData(0, 0, 40, 40).data
    let r = 0, g = 0, b = 0, count = 0
    for (let y = 0; y < 40; y++) {
      for (let x = 0; x < 40; x++) {
        const i = (y * 40 + x) * 4
        r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; count++
      }
    }
    overlayRgb.value = {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count),
    }
  }
  img.src = imgSrc
}

const overlayStyle = computed(() => {
  if (!overlayRgb.value) return {}
  const { r, g, b } = overlayRgb.value
  return {
    background: `linear-gradient(to top, rgba(${r},${g},${b},0.8) 0%, rgba(${r},${g},${b},0.5) 50%, rgba(${r},${g},${b},0.2) 100%)`,
  }
})

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
  notFound.value = false
  try {
    const { data } = await getPublicStory(route.params.id)
    story.value = data.data || data
    if (story.value?.cover_image) {
      extractImageColor(story.value.cover_image)
    }
  } catch (err) {
    if (err.response?.status === 404) {
      notFound.value = true
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
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <!-- Loading -->
    <div v-if="loading" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
      <div class="space-y-6 animate-pulse">
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
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
      <div class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
        </div>
        <p class="text-lg font-semibold text-slate-700 dark:text-slate-300">{{ error }}</p>
        <button @click="fetchStory" class="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 hover:bg-brand-primary-hover transition cursor-pointer">{{ t('common.retry') }}</button>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="notFound" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
      <div class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div class="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504 1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504 1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" /></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ t('stories.notFound') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('stories.notFoundDesc') }}</p>
        <router-link to="/stories" class="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 hover:bg-brand-primary-hover transition">{{ t('stories.backToStories') }}</router-link>
      </div>
    </div>

    <!-- Story Detail -->
    <div v-else-if="story" class="animate-fade-in">
      <!-- Full-width Cover -->
      <div class="relative overflow-hidden pt-28 lg:pt-32 pb-24 lg:pb-32">
        <div v-if="story.cover_image" class="absolute inset-0">
          <img :src="story.cover_image" :alt="localField(story, 'title')" class="w-full h-full object-cover" />
          <div class="absolute inset-0" :style="overlayRgb ? overlayStyle : { background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.5) 50%, rgba(15,23,42,0.2) 100%)' }"></div>
        </div>
        <div v-else class="absolute inset-0 bg-gradient-to-br from-brand-primary/30 to-brand-primary/60">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/30 to-transparent"></div>
        </div>
        <div class="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div>

        <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav class="flex items-center gap-2 text-sm font-medium text-white/60 mb-6">
            <router-link to="/stories" class="hover:text-white transition">{{ t('nav.stories') }}</router-link>
            <svg class="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-white/80 truncate max-w-[250px]">{{ localField(story, 'title') }}</span>
          </nav>

          <div class="flex items-center gap-3 mb-4">
            <span v-if="story.is_fundraising" class="px-2.5 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-bold rounded-md uppercase tracking-wider">Fundraiser</span>
            <CategoryBadge v-if="storyCategory()" :category="storyCategory()" size="xs" />
          </div>

          <div class="flex items-center gap-3">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl">{{ localField(story, 'title') }}</h1>
            <FavoriteButton :favoritable-id="story.uuid || story.id" favoritable-type="story" :is-favorited="story?.is_favorited" size="lg" />
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-16 relative z-10">
        <!-- Tags Row -->
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <span v-if="story.is_fundraising" class="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            {{ t('myStories.fundraiser') }}
          </span>
          <CategoryBadge v-if="storyCategory()" :category="storyCategory()" size="sm" />
          <span class="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg">
            {{ formatDate(story.created_at) }}
          </span>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
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

            <!-- Content Body -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-brand-primary text-xl">article</span>
                {{ t('stories.storyContent') || 'Story' }}
              </h2>
              <div
                class="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed"
                :dir="contentLang === 'ar' ? 'rtl' : 'ltr'"
                v-html="story.content?.[contentLang] || ''"
              ></div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
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
              <template v-if="goalReached">
                <div class="mt-5 w-full rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20 py-3.5 px-4 text-center">
                  <div class="flex items-center justify-center gap-2 text-sm font-bold text-green-700 dark:text-green-400">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Goal Reached
                  </div>
                  <p class="text-xs text-green-600 dark:text-green-300 mt-0.5">Thank you for your amazing support!</p>
                </div>
              </template>
              <button
                v-else
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

            <!-- Story Details Card -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ t('stories.details') || 'Story Details' }}</h3>

              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm shrink-0">{{ patientName().charAt(0) || '?' }}</div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('stories.patient') || 'Patient' }}</p>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ patientName() }}</p>
                </div>
              </div>

              <div v-if="storyCategory()" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" d="M6 6h.008v.008H6V6z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('stories.category') || 'Category' }}</p>
                  <CategoryBadge :category="storyCategory()" size="sm" />
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('stories.published') || 'Published' }}</p>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ formatDate(story.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <LandingFooter />
  </div>

  <DonateModal :show="showDonate" :story="story" @close="showDonate = false" />
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
</style>