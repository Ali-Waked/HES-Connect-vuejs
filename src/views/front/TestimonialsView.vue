<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useUserReviewStore } from '@/stores/userReview'
import { getPublicPlatformReviews } from '@/services/public/reviewService'
import { usePublicToast } from '@/composables/usePublicToast'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import TestimonialCard from '@/components/testimonials/TestimonialCard.vue'
import ReviewForm from '@/components/testimonials/ReviewForm.vue'
import TestimonialsPagination from '@/components/testimonials/TestimonialsPagination.vue'
import EmptyTestimonials from '@/components/testimonials/EmptyTestimonials.vue'
import PublicToastContainer from '@/components/global/PublicToastContainer.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userReviewStore = useUserReviewStore()
const { addToast } = usePublicToast()

const reviews = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const pagination = ref({})

async function fetchReviews() {
  loading.value = true
  error.value = null
  try {
    const { data } = await getPublicPlatformReviews({
      page: currentPage.value,
      per_page: 9,
    })
    reviews.value = data.data || []
    pagination.value = {
      current_page: data.meta?.current_page || 1,
      last_page: data.meta?.last_page || 1,
      total: data.meta?.total || 0,
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || t('testimonials.errorLoading')
  } finally {
    loading.value = false
  }
}

function onPageChange(page) {
  currentPage.value = page
  fetchReviews()
  window.scrollTo({ top: 400, behavior: 'smooth' })
}

function goToLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}

function onReviewSubmitted() {
  userReviewStore.fetchMyReview()
  fetchReviews()
}

onMounted(() => {
  fetchReviews()
  if (authStore.authenticated) {
    userReviewStore.fetchMyReview()
  }
})

watch(() => authStore.authenticated, (isAuth) => {
  if (isAuth) {
    userReviewStore.fetchMyReview()
  } else {
    userReviewStore.reset()
  }
})
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="pt-28 lg:pt-32">
      <!-- Hero -->
      <section class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 lg:py-20">
        <div class="absolute inset-0 hero-grid-pattern opacity-50"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span class="eyebrow-badge mb-4 text-amber-500 bg-amber-500/10 border border-amber-500/20">{{ t('home.testimonialsBadge') }}</span>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            {{ t('testimonials.pageTitle') }}
          </h1>
          <p class="text-lg text-slate-400 max-w-2xl mx-auto">
            {{ t('testimonials.pageSubtitle') }}
          </p>
        </div>
      </section>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <!-- Review Form Card -->
        <div class="mb-12 max-w-2xl mx-auto">
          <template v-if="authStore.authenticated">
            <div v-if="userReviewStore.loading" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
              <div class="animate-pulse space-y-4">
                <div class="h-5 bg-slate-100 dark:bg-slate-700 rounded w-48"></div>
                <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-64"></div>
                <div class="flex gap-2">
                  <div v-for="n in 5" :key="n" class="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700"></div>
                </div>
                <div class="h-24 bg-slate-100 dark:bg-slate-700 rounded-xl"></div>
                <div class="h-10 w-40 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
              </div>
            </div>
            <ReviewForm v-else @submitted="onReviewSubmitted" />
          </template>

          <!-- Not authenticated CTA -->
          <div v-else class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm relative overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary"></div>
            <div class="w-14 h-14 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 001.902 0l1.519-4.674c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('testimonials.loginCtaTitle') }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">{{ t('testimonials.loginCtaDesc') }}</p>
            <button @click="goToLogin" class="btn-primary px-7 py-2.5">
              {{ t('nav.login') }}
            </button>
          </div>
        </div>

        <!-- Loading skeletons -->
        <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="n in 9" :key="n" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24"></div>
                <div class="h-2.5 bg-slate-100 dark:bg-slate-700 rounded w-16"></div>
              </div>
            </div>
            <div class="flex gap-1 mb-3">
              <div v-for="s in 5" :key="s" class="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700"></div>
            </div>
            <div class="space-y-2">
              <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
              <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
              <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>
          <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('testimonials.errorLoading') }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
          <button class="btn-primary" @click="fetchReviews">{{ t('testimonials.retry') }}</button>
        </div>

        <!-- Empty state -->
        <EmptyTestimonials v-else-if="reviews.length === 0" />

        <!-- Reviews grid -->
        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="animate-fade-in-up"
          >
            <TestimonialCard :review="review" />
          </div>
        </div>

        <!-- Pagination -->
        <TestimonialsPagination
          v-if="!loading && reviews.length > 0"
          :current-page="pagination.current_page"
          :last-page="pagination.last_page"
          :total="pagination.total"
          @update:current-page="onPageChange"
        />
      </div>
    </main>

    <LandingFooter />
    <PublicToastContainer />
  </div>
</template>
