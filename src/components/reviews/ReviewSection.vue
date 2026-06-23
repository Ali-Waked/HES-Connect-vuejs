<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useUserReviewStore } from '@/stores/userReview';
import * as publicApi from '@/api/public';
import ReviewCard from './ReviewCard.vue';
import ReviewForm from './ReviewForm.vue';
import LandingSection from '@/components/landing/LandingSection.vue';
import PublicToastContainer from '@/components/global/PublicToastContainer.vue';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userReviewStore = useUserReviewStore();

const reviews = ref([]);
const loading = ref(true);

const featured = computed(() => reviews.value.filter(r => r.is_featured));
const regular = computed(() => reviews.value.filter(r => !r.is_featured));

onMounted(async () => {
  try {
    const res = await publicApi.getPlatformReviews({ per_page: 50 });
    reviews.value = res.data || res || [];
  } finally {
    loading.value = false;
  }
  if (authStore.authenticated) {
    userReviewStore.fetchMyReview();
  }
});

function goToLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } });
}

function onReviewSubmitted() {
  userReviewStore.fetchMyReview();
  publicApi.getPlatformReviews({ per_page: 50 }).then(res => {
    reviews.value = res.data || res || [];
  });
}
</script>

<template>
  <LandingSection class="py-16 lg:py-20 bg-landing-cream dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10">
        <h2 class="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{{ t('publicReviews.title') }}</h2>
        <p class="text-sm text-slate-500 mt-1 dark:text-slate-400">{{ t('publicReviews.subtitle') }}</p>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="n in 3" :key="n" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24" />
              <div class="h-2.5 bg-slate-100 dark:bg-slate-700 rounded w-16" />
            </div>
          </div>
          <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full mb-1.5" />
          <div class="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
        </div>
      </div>

      <div v-else-if="reviews.length === 0" class="text-center py-12">
        <svg class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 001.005.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <h3 class="text-base font-bold text-slate-500 dark:text-slate-400">{{ t('publicReviews.noReviews') }}</h3>
        <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">{{ t('publicReviews.noReviewsDesc') }}</p>
      </div>

      <div v-else class="space-y-8">
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ReviewCard v-for="review in reviews" :key="review.id" :review="review" />
        </div>
      </div>

      <div class="mt-12 max-w-2xl mx-auto">
        <template v-if="authStore.authenticated">
          <div v-if="userReviewStore.loading" class="flex justify-center py-8">
            <svg class="w-6 h-6 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
          <ReviewForm v-else @submitted="onReviewSubmitted" />
        </template>
        <div v-else class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
          <div class="w-14 h-14 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 001.902 0l1.519-4.674c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('publicReviews.loginCtaTitle') }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">{{ t('publicReviews.loginCtaDesc') }}</p>
          <button @click="goToLogin" class="btn-primary px-7 py-2.5">
            {{ t('nav.login') }}
          </button>
        </div>
      </div>
    </div>
  </LandingSection>

  <PublicToastContainer />
</template>
