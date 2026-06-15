<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <div class="relative hero-gradient overflow-hidden pt-28 lg:pt-32 pb-14 lg:pb-20">
      <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex items-center gap-2 text-sm text-white/60 mb-4" aria-label="Breadcrumb">
          <router-link to="/" class="hover:text-white transition-colors">{{ $t('nav.home') }}</router-link>
          <span class="text-white/40">/</span>
          <router-link to="/stories" class="hover:text-white transition-colors">{{ $t('nav.stories') }}</router-link>
        </nav>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
          {{ story ? localField(story, 'title') : '' }}
        </h1>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div>
    </div>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 -mt-6 relative z-10">
      <div v-if="loading" class="animate-pulse space-y-6">
        <div class="h-4 w-64 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div class="flex gap-6">
          <div class="flex-1 space-y-4">
            <div class="h-80 w-full rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
            <div class="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div class="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div class="h-4 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div class="hidden lg:block w-80 space-y-4">
            <div class="h-48 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
            <div class="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>
      </div>

      <template v-else-if="!story">
        <div class="empty-state">
          <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-500">heart_broken</span>
          <h2 class="mt-4 text-xl font-bold text-slate-900 dark:text-white">{{ $t('stories.notFound') }}</h2>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ $t('stories.notFoundDesc') }}</p>
          <button class="btn-primary mt-6" @click="$router.push('/stories')">
            {{ $t('stories.backToStories') }}
          </button>
        </div>
      </template>

      <template v-else>
        <div class="mb-8">
          <div class="w-16 h-1 rounded-full bg-brand-primary mb-6"></div>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
          <div class="flex-1 min-w-0 space-y-8">
            <StoryGallery :images="story.images" :title="localField(story, 'title')" :patient-first-name="localField(story, 'patientFirstName')" />

            <div class="space-y-3 rtl:text-right">
              <span class="badge-primary">{{ localField(story, 'category') }}</span>
              <h1 class="text-3xl font-bold text-slate-900 tracking-tight leading-tight">{{ localField(story, 'title') }}</h1>
              <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 rtl:flex-row-reverse rtl:justify-end">
                <span>{{ formatDate(story.createdAt) }}</span>
                <span>{{ localField(story, 'location') }}</span>
                <span>{{ localField(story, 'patientFirstName') }}, {{ story.patientAge }} yrs</span>
              </div>
            </div>

            <div class="border-t border-slate-200 pt-6">
              <StoryContent :content="localField(story, 'content')" />
            </div>

            <div class="border-t border-slate-200 pt-6">
              <StoryUpdates :updates="story.updates" />
            </div>

            <div class="border-t border-slate-200 pt-6">
              <RelatedStories :story="story" />
            </div>
          </div>

          <aside class="w-full lg:w-80 flex-shrink-0">
            <div class="lg:sticky lg:top-6 space-y-6">
              <FundraisingCard :story="story" />
              <ShareCard :story="story" />
              <div v-if="story.tags && story.tags.length" class="card-base p-6">
                <h3 class="mb-4 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{{ $t('articles.tags') }}</h3>
                <div class="flex flex-wrap gap-2 rtl:flex-row-reverse">
                  <router-link v-for="tag in story.tags" :key="tag" :to="'/stories?tag=' + tag"
                    class="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold bg-brand-primary-light dark:bg-brand-primary/20 text-brand-primary transition hover:bg-brand-primary/20">
                    {{ tag }}
                  </router-link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </template>
    </main>

    <LandingFooter />
    <StoryToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStoriesStore } from '@/stores/useStoriesStore';
import AppNavbar from '@/components/global/AppNavbar.vue';
import LandingFooter from '@/components/landing/LandingFooter.vue';
import StoryGallery from '@/components/story/StoryGallery.vue';
import StoryContent from '@/components/story/StoryContent.vue';
import StoryUpdates from '@/components/story/StoryUpdates.vue';
import RelatedStories from '@/components/story/RelatedStories.vue';
import FundraisingCard from '@/components/story/FundraisingCard.vue';
import ShareCard from '@/components/story/ShareCard.vue';
import StoryToastContainer from '@/components/story/StoryToastContainer.vue';
import { useLocaleField } from '@/composables/useLocaleField';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const store = useStoriesStore();
const { localField } = useLocaleField();
const { t, locale } = useI18n();
const loading = ref(true);

const storyId = computed(() => route.params.id);
const story = computed(() => store.stories.find(s => s.id === Number(storyId.value)));

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 500);
});
</script>
