<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import TestimonialCard from './TestimonialCard.vue'

const { t } = useI18n()
const router = useRouter()

const props = defineProps({
  reviews: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const displayReviews = computed(() => {
  const featured = props.reviews.filter(r => r.is_featured)
  if (featured.length >= 3) return featured.slice(0, 6)
  return props.reviews.slice(0, 6)
})

const currentIndex = ref(0)
let autoplayInterval = null

function startAutoplay() {
  stopAutoplay()
  if (displayReviews.value.length > 1) {
    autoplayInterval = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % displayReviews.value.length
    }, 5000)
  }
}

function stopAutoplay() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

function goTo(idx) {
  currentIndex.value = idx
  startAutoplay()
}

watch(() => displayReviews.value.length, () => {
  currentIndex.value = 0
  startAutoplay()
}, { immediate: true })

onBeforeUnmount(() => stopAutoplay())
</script>

<template>
  <section data-aos="fade-up" class="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header with View All button -->
      <div class="flex items-end justify-between mb-12 animate-fade-in-up">
        <div>
          <span class="eyebrow-badge mb-4">{{ t('home.testimonialsBadge') }}</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{{ t('home.reviewsTitle') }}</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-2">{{ t('home.reviewsSubtitle') }}</p>
        </div>
        <button class="btn-ghost shrink-0 group/btn" @click="router.push('/testimonials')">
          {{ t('testimonials.viewAll') }}
          <svg class="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>
      </div>

      <!-- Loading skeletons -->
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24"></div>
              <div class="h-2.5 bg-slate-100 dark:bg-slate-700 rounded w-16"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
            <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="displayReviews.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <svg class="empty-state-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 001.005.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </div>
        <h3 class="text-base font-bold text-slate-500 dark:text-slate-400">{{ t('home.reviewsEmpty') }}</h3>
        <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">{{ t('home.reviewsEmptyHint') }}</p>
      </div>

      <!-- Slider -->
      <div v-else class="relative max-w-3xl mx-auto">
        <div class="overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-out"
            :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
          >
            <div
              v-for="review in displayReviews"
              :key="review.id"
              class="w-full shrink-0 px-1"
            >
              <TestimonialCard :review="review" />
            </div>
          </div>
        </div>

        <!-- Dot indicators -->
        <div v-if="displayReviews.length > 1" class="flex items-center justify-center gap-2 mt-8">
          <button
            v-for="(_, idx) in displayReviews"
            :key="idx"
            class="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
            :class="idx === currentIndex ? 'bg-brand-primary w-6' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'"
            @click="goTo(idx)"
          />
        </div>
      </div>
    </div>
  </section>
</template>
