<template>
  <div class="min-h-screen bg-landing-cream font-sans antialiased text-landing-dark">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-28 lg:pt-32">
      <div v-if="loading" class="animate-pulse space-y-6">
        <div class="h-4 w-64 rounded bg-slate-200"></div>
        <div class="flex gap-6">
          <div class="flex-1 space-y-4">
            <div class="h-80 w-full rounded-xl bg-slate-200"></div>
            <div class="h-4 w-3/4 rounded bg-slate-200"></div>
            <div class="h-4 w-1/2 rounded bg-slate-200"></div>
            <div class="h-4 w-full rounded bg-slate-200"></div>
          </div>
          <div class="hidden lg:block w-80 space-y-4">
            <div class="h-48 rounded-xl bg-slate-200"></div>
            <div class="h-24 rounded-xl bg-slate-200"></div>
          </div>
        </div>
      </div>

      <template v-else-if="!story">
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <span class="material-symbols-outlined text-6xl text-slate-300">heart_broken</span>
          <h2 class="mt-4 text-xl font-bold text-slate-900">{{ $t('stories.notFound') }}</h2>
          <p class="mt-2 text-sm text-slate-500">{{ $t('stories.notFoundDesc') }}</p>
          <button class="mt-6 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-hover transition" @click="$router.push('/stories')">
            {{ $t('stories.backToStories') }}
          </button>
        </div>
      </template>

      <template v-else>
        <nav data-aos="fade-up" class="mb-6 text-sm text-slate-500 rtl:text-right">
          <router-link to="/" class="hover:text-slate-700 transition">{{ $t('nav.home') }}</router-link>
          <span class="mx-2">/</span>
          <router-link to="/stories" class="hover:text-slate-700 transition">{{ $t('nav.stories') }}</router-link>
          <span class="mx-2">/</span>
          <span class="text-slate-900 font-semibold">{{ localField(story, 'title').length > 40 ? localField(story, 'title').slice(0, 40) + '...' : localField(story, 'title') }}</span>
        </nav>

        <div class="flex flex-col lg:flex-row gap-8">
          <div class="flex-1 min-w-0 space-y-8">
            <div data-aos="fade-up"><StoryGallery :images="story.images" :title="localField(story, 'title')" :patient-first-name="localField(story, 'patientFirstName')" /></div>

            <div data-aos="fade-up" class="space-y-2 rtl:text-right">
              <span class="inline-flex items-center rounded-full bg-teal-100/30 px-3 py-1 text-xs font-bold text-teal-700">{{ localField(story, 'category') }}</span>
              <h1 class="text-2xl font-bold text-slate-900 mt-3">{{ localField(story, 'title') }}</h1>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-2 rtl:flex-row-reverse rtl:justify-end">
                <span>📅 {{ formatDate(story.createdAt) }}</span>
                <span>📍 {{ localField(story, 'location') }}</span>
                <span>👤 {{ localField(story, 'patientFirstName') }}, {{ story.patientAge }} {{ $t('doctors.experience', { years: '' }).replace(':years', '').trim() }}, {{ story.patientGender === 'female' ? $t('common.no') : $t('common.yes') }}</span>
              </div>
              <div class="flex flex-wrap gap-2 mt-2 rtl:justify-end">
                <span v-for="tag in story.tags" :key="tag"
                  class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {{ tag }}
                </span>
              </div>
            </div>

            <div data-aos="fade-up" class="border-t border-slate-200 pt-6">
              <StoryContent :content="localField(story, 'content')" />
            </div>

            <div data-aos="fade-up" class="border-t border-slate-200 pt-6">
              <StoryUpdates :updates="story.updates" />
            </div>

            <div data-aos="fade-up" class="border-t border-slate-200 pt-6">
              <RelatedStories :story="story" />
            </div>
          </div>

          <aside class="w-full lg:w-80 flex-shrink-0 space-y-4">
            <div class="lg:sticky lg:top-6 space-y-4">
              <div data-aos="fade-up"><FundraisingCard :story="story" /></div>
              <div data-aos="fade-up"><ShareCard :story="story" /></div>
              <div data-aos="fade-up" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm rtl:text-right">
                <h3 class="mb-3 text-sm font-bold text-slate-900">{{ $t('articles.tags') }}</h3>
                <div class="flex flex-wrap gap-2 rtl:flex-row-reverse">
                  <router-link v-for="tag in story.tags" :key="tag" :to="'/stories?tag=' + tag"
                    class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200">
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
