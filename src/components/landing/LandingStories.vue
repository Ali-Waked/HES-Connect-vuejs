<script setup>
import { useRouter } from 'vue-router';
import LandingSection from './LandingSection.vue';
import LandingSkeleton from './LandingSkeleton.vue';

defineProps({
  stories: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const router = useRouter();

const progress = (raised, goal) => goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
const fmt = (n) => '$' + (n || 0).toLocaleString();
</script>

<template>
  <LandingSection id="stories" class="py-16 lg:py-20 bg-landing-warm dark:bg-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Stories That Need Your Support</h2>
        <button class="text-sm font-semibold text-brand-primary hover:underline transition cursor-pointer" @click="router.push('/stories')">View All →</button>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <LandingSkeleton variant="card" :count="3" />
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="story in stories"
          :key="story.id"
          class="bg-white dark:bg-slate-800 rounded-xl border border-landing-border dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/20 transition-all duration-200 group"
        >
          <div class="h-44 overflow-hidden bg-slate-100 dark:bg-slate-700">
            <img
              v-if="story.cover_image"
              :src="story.cover_image"
              :alt="story.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-slate-100 dark:from-slate-700 to-slate-200 dark:to-slate-600 flex items-center justify-center">
              <svg class="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/>
              </svg>
            </div>
          </div>
          <div class="p-5 space-y-3">
            <p class="text-xs font-semibold text-brand-primary">{{ story.patient_first_name }}'s Story</p>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">{{ story.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{{ story.content_excerpt }}</p>
            <div class="space-y-2 pt-1">
              <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  class="h-1.5 rounded-full bg-gradient-to-r from-brand-primary to-teal-400 transition-all duration-500"
                  :style="`width:${progress(story.collected_amount, story.target_amount)}%`"
                ></div>
              </div>
              <p class="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {{ fmt(story.collected_amount) }} collected of {{ fmt(story.target_amount) }} goal
              </p>
            </div>
            <button
              class="w-full py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition cursor-pointer"
              @click="router.push('/login')"
            >Support Now</button>
          </div>
        </div>
      </div>
    </div>
  </LandingSection>
</template>
