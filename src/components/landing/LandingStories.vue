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
  <LandingSection id="stories" class="py-16 lg:py-20 bg-landing-warm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900">Stories That Need Your Support</h2>
        <button class="text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition cursor-pointer" @click="router.push('/login')">View All →</button>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <LandingSkeleton variant="card" :count="3" />
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="story in stories"
          :key="story.id"
          class="bg-landing-cream rounded-xl border border-landing-border overflow-hidden shadow-sm hover:shadow-md hover:border-brand-primary/20 transition-all duration-200 group"
        >
          <div class="h-44 overflow-hidden bg-slate-100">
            <img
              v-if="story.cover_image"
              :src="story.cover_image"
              :alt="story.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-600"></div>
          </div>
          <div class="p-5 space-y-3">
            <p class="text-xs font-semibold text-brand-primary">{{ story.patient_first_name }}'s Story</p>
            <h3 class="text-base font-bold text-slate-900 leading-snug line-clamp-2">{{ story.title }}</h3>
            <p class="text-sm text-slate-500 line-clamp-2">{{ story.content_excerpt }}</p>
            <div class="space-y-2 pt-1">
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  class="h-2 rounded-full bg-gradient-to-r from-brand-primary to-teal-400 transition-all duration-500"
                  :style="`width:${progress(story.collected_amount, story.target_amount)}%`"
                ></div>
              </div>
              <p class="text-xs font-semibold text-slate-600">
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
