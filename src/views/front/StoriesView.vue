<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getPublicStories } from '@/services/publicStoriesService'
import { useCategories } from '@/composables/useCategories'
import { resolveTranslatedValue } from '@/utils/locale'
import CategoryBadge from '@/components/shared/CategoryBadge.vue'
import FavoriteButton from '@/components/favorites/FavoriteButton.vue'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const { categories, fetchCategories } = useCategories()
fetchCategories({ type: 'story', per_page: 100 })

const stories = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const fundraisingOnly = ref(false)
const categoryFilter = ref('')
const pagination = ref({})
const currentPage = ref(1)

const visiblePages = computed(() => {
  const total = pagination.value.last_page || 1
  const current = pagination.value.current_page || 1
  const pages = []
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const filterParams = computed(() => {
  const params = { page: currentPage.value, per_page: 12 }
  if (searchQuery.value.trim()) params.search = searchQuery.value.trim()
  if (fundraisingOnly.value) params.is_fundraising = true
  if (categoryFilter.value) params.category_id = categoryFilter.value
  return params
})

function progressPercent(story) {
  if (!story.target_amount || story.target_amount <= 0) return 0
  return Math.min(100, ((story.collected_amount || 0) / story.target_amount) * 100)
}

function formatCurrency(val) {
  if (val == null) return ''
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return Number(val).toLocaleString(loc, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatDate(val) {
  if (!val) return ''
  try {
    const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
    return new Date(val.replace(' ', 'T')).toLocaleDateString(loc, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return val }
}

function storyTitle(story) {
  if (story.title && typeof story.title === 'object') return resolveTranslatedValue(story.title) || ''
  return story.title || ''
}

function storyExcerpt(story) {
  const content = story.content
  if (!content) return ''
  const text = typeof content === 'object' ? (content.en || content.ar || '') : content
  return text.replace(/<[^>]*>/g, '').substring(0, 120) + (text.length > 120 ? '...' : '')
}

function patientName(story) {
  if (story.patient?.name) return resolveTranslatedValue(story.patient.name)
  if (story.patient_first_name) return story.patient_first_name
  return ''
}

function storyCategory(story) {
  if (!story.category_id && !story.category) return null
  const catId = story.category_id || story.category?.id || story.category?.uuid
  if (!catId) return null
  return categories.value.find(c => (c.uuid || c.id) == catId) || (story.category || null)
}

function pushQuery(updates) {
  const query = { ...route.query }
  for (const [key, val] of Object.entries(updates)) {
    if (val === '' || val === undefined || val === null || val === false) {
      delete query[key]
    } else {
      query[key] = String(val)
    }
  }
  router.push({ query })
}

function parseParams(query) {
  return {
    search: query.search || '',
    fundraising: query.fundraising === '1',
    category: query.category || '',
    page: parseInt(query.page) || 1,
  }
}

async function fetchStories() {
  loading.value = true
  error.value = null
  try {
    const { data } = await getPublicStories(filterParams.value)
    stories.value = data.data || []
    pagination.value = {
      current_page: data.meta?.current_page || 1,
      last_page: data.meta?.last_page || 1,
      total: data.meta?.total || 0,
    }
  } catch (err) {
    error.value = err.response?.data?.message || t('stories.errorLoading')
  } finally {
    loading.value = false
  }
}

function goToDetail(id) {
  router.push(`/stories/${id}`)
}

let searchTimeout = null
function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pushQuery({ search: searchQuery.value || undefined, page: undefined })
  }, 400)
}

function onFilterChange() {
  pushQuery({
    search: searchQuery.value || undefined,
    fundraising: fundraisingOnly.value || undefined,
    category: categoryFilter.value || undefined,
    page: undefined,
  })
}

function changePage(page) {
  pushQuery({ page: page > 1 ? page : undefined })
}

watch(
  () => route.query,
  (query) => {
    const p = parseParams(query)
    searchQuery.value = p.search
    fundraisingOnly.value = p.fundraising
    categoryFilter.value = p.category
    currentPage.value = p.page
    fetchStories()
  },
  { immediate: true }
)
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
      <!-- Hero Section -->
      <div class="text-center mb-10">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {{ t('stories.title') }}
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {{ t('stories.description') }}
        </p>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto">
        <div class="relative flex-grow">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 shadow-sm transition"
            :placeholder="t('stories.searchPlaceholder')"
            @input="onSearchInput"
          />
        </div>
        <select
          v-model="categoryFilter"
          class="min-w-[160px] p-3 pr-9 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px] shadow-sm transition"
          style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E');"
          @change="onFilterChange"
        >
          <option value="">{{ t('stories.allCategories') }}</option>
          <option v-for="cat in categories.filter(c => c.type === 'story')" :key="cat.uuid || cat.id" :value="cat.uuid || cat.id">{{ resolveTranslatedValue(cat.name) }}</option>
        </select>
        <label class="flex items-center gap-2 px-4 py-3 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer shrink-0 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700">
          <input type="checkbox" v-model="fundraisingOnly" class="rounded border-slate-300 dark:border-slate-600 text-brand-primary focus:ring-brand-primary/30 cursor-pointer" @change="onFilterChange" />
          {{ t('stories.fundraisingOnly') }}
        </label>
      </div>

      <!-- Loading Skeletons -->
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
          <div class="aspect-[4/3] bg-slate-200 dark:bg-slate-700"></div>
          <div class="p-5 space-y-3">
            <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
        </div>
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
        <button class="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition cursor-pointer" @click="fetchStories">{{ t('stories.retry') }}</button>
      </div>

      <!-- Empty -->
      <div v-else-if="!stories.length" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('stories.noStories') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('stories.noStoriesDesc') }}</p>
      </div>

      <!-- Card Grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="story in stories"
          :key="story.id"
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
          @click="goToDetail(story.id)"
        >
          <!-- Cover Image -->
          <div class="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700 relative">
            <img
              v-if="story.cover_image"
              :src="story.cover_image"
              :alt="t('stories.coverImageAlt')"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/40 flex items-center justify-center">
              <svg class="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path stroke-linecap="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/>
              </svg>
            </div>
            <div class="absolute top-3 right-3 z-10">
              <FavoriteButton :favoritable-id="story.uuid || story.id" favoritable-type="story" :is-favorited="story.is_favorited" size="sm" @click.stop />
            </div>
            <!-- Fundraising Badge -->
            <div v-if="story.is_fundraising" class="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-300 shadow-sm">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              {{ t('myStories.fundraiser') }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 space-y-3">
            <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>{{ formatDate(story.created_at) }}</span>
              <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span>{{ t('stories.byPatient', { name: patientName(story) }) }}</span>
              <template v-if="story.category_id || story.category">
                <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <CategoryBadge :category="storyCategory(story)" size="xs" />
              </template>
            </div>

            <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">{{ storyTitle(story) }}</h3>

            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" :class="story.is_fundraising ? 'line-clamp-2' : 'line-clamp-3'">{{ storyExcerpt(story) }}</p>

            <!-- Fundraising Progress -->
            <div v-if="story.is_fundraising && story.target_amount" class="pt-1">
              <template v-if="(story.collected_amount || 0) >= story.target_amount">
                <div class="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
                  <svg class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-xs font-bold text-green-700 dark:text-green-300">{{ t('stories.goalReached') }}</span>
                </div>
              </template>
              <template v-else>
                <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    class="h-2 rounded-full bg-brand-primary transition-all duration-700"
                    :style="{ width: progressPercent(story) + '%' }"
                  ></div>
                </div>
                <div class="flex items-center justify-between text-xs mt-1.5">
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ formatCurrency(story.collected_amount) }} {{ t('stories.raised') }}</span>
                  <span class="text-slate-400">{{ t('stories.of') }} {{ formatCurrency(story.target_amount) }}</span>
                </div>
              </template>
            </div>

            <button
              class="w-full rounded-xl bg-brand-primary text-white py-2.5 text-sm font-bold hover:bg-brand-primary-dark transition cursor-pointer"
              @click.stop="goToDetail(story.id)"
            >{{ t('stories.readMore') }}</button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex items-center justify-center gap-2 mt-10">
        <button
          :disabled="pagination.current_page <= 1"
          class="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          @click="changePage(pagination.current_page - 1)"
        >{{ t('common.previous') || 'Prev' }}</button>
        <template v-for="p in visiblePages" :key="p">
          <button
            class="w-9 h-9 text-sm font-bold rounded-lg border transition cursor-pointer"
            :class="p === pagination.current_page
              ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'"
            @click="changePage(p)"
          >{{ p }}</button>
        </template>
        <button
          :disabled="pagination.current_page >= pagination.last_page"
          class="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          @click="changePage(pagination.current_page + 1)"
        >{{ t('common.next') || 'Next' }}</button>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
