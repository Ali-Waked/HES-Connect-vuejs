<script setup>
import { useRouter } from 'vue-router';
import LandingSkeleton from './LandingSkeleton.vue';
import { useLocaleField } from '@/composables/useLocaleField';
import { useI18n } from 'vue-i18n';

defineProps({
  stories: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const router = useRouter();
const { localField } = useLocaleField();
const { locale } = useI18n();

const progress = (raised, goal) => goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
const fmt = (n) => (locale.value === 'ar' ? ' ' : '$') + (n || 0).toLocaleString() + (locale.value === 'ar' ? ' $' : '');
</script>

<template>
  <section class="py-16 lg:py-20 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-10 animate-fade-in-up">
        <div>
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900">{{ $t('stories.title') }}</h2>
          <p class="text-slate-500 mt-2">Real stories from our community.</p>
        </div>
        <button class="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition cursor-pointer" @click="router.push('/stories')">
          {{ $t('stories.viewAll') }} {{ locale === 'ar' ? '←' : '→' }}
        </button>
      </div>

      <div v-if="loading" class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 rounded-lg border border-slate-200 overflow-hidden animate-pulse">
          <div class="h-72 bg-slate-100"></div>
        </div>
        <LandingSkeleton variant="card" :count="1" />
      </div>

      <div v-else-if="stories.length === 0" class="text-center py-12 animate-fade-in-up">
        <p class="text-slate-500">No stories available yet.</p>
      </div>

      <div v-else class="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div
          v-for="(story, idx) in stories.slice(0, 1)"
          :key="story.id"
          class="lg:col-span-2 group relative rounded-lg overflow-hidden cursor-pointer bg-white border border-slate-200 shadow-soft hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
          @click="router.push(`/stories/${story.id}`)"
        >
          <div class="grid sm:grid-cols-2 h-full">
            <div class="relative h-56 sm:h-auto overflow-hidden bg-slate-100">
              <img
                v-if="story.cover_image"
                :src="story.cover_image"
                :alt="localField(story, 'title')"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center">
                <svg class="w-12 h-12 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/>
                </svg>
              </div>
            </div>
            <div class="p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <span class="text-xs font-semibold text-brand-primary uppercase tracking-wider">Featured Story</span>
                <h3 class="text-lg lg:text-xl font-bold text-slate-900 line-clamp-2 mt-2 group-hover:text-brand-primary transition-colors">{{ localField(story, 'title') }}</h3>
                <p class="text-sm text-slate-500 line-clamp-3 mt-2 leading-relaxed">{{ localField(story, 'content_excerpt') || localField(story, 'content') }}</p>
              </div>
              <div class="mt-4 space-y-2">
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-500" :style="`width:${progress(story.collected_amount, story.target_amount)}%`"></div>
                </div>
                <div class="flex justify-between items-center">
                  <p class="text-xs font-semibold text-slate-600">{{ $t('stories.collected', { amount: fmt(story.collected_amount), goal: fmt(story.target_amount) }) }}</p>
                  <span class="text-xs font-bold text-brand-primary">{{ $t('stories.supportNow') }} →</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="(story, idx) in stories.slice(1, 3)"
            :key="story.id"
            class="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer animate-fade-in-up"
            :style="{ animationDelay: `${(idx + 1) * 0.1}s` }"
            @click="router.push(`/stories/${story.id}`)"
          >
            <div class="flex items-stretch h-full">
              <div class="w-24 shrink-0 overflow-hidden bg-slate-100">
                <img
                  v-if="story.cover_image"
                  :src="story.cover_image"
                  :alt="localField(story, 'title')"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center">
                  <svg class="w-6 h-6 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
                <h3 class="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-brand-primary transition-colors">{{ localField(story, 'title') }}</h3>
                <div class="mt-2 space-y-1">
                  <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div class="h-1.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" :style="`width:${progress(story.collected_amount, story.target_amount)}%`"></div>
                  </div>
                  <p class="text-[11px] font-semibold text-slate-500">{{ fmt(story.collected_amount) }} raised</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
