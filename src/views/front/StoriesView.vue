<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getStories } from '../../api/public';
import AppNavbar from '../../components/global/AppNavbar.vue';
import LandingFooter from '../../components/landing/LandingFooter.vue';
import { resolveTranslatedValue } from '../../utils/locale';

const router = useRouter();
const stories = ref([]);
const loading = ref(true);

const progress = (raised, goal) => goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
const fmt = (n) => '$' + (n || 0).toLocaleString();

onMounted(async () => {
  stories.value = await getStories();
  loading.value = false;
});
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <div class="relative hero-gradient overflow-hidden pt-28 lg:pt-32 pb-14 lg:pb-20">
      <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">Patient Stories</h1>
        <p class="mt-2 text-lg text-white/75 max-w-2xl">
          Real experiences from our community. Read their journeys and support those in need.
        </p>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div>
    </div>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 -mt-6 relative z-10">

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="card-base overflow-hidden animate-pulse">
          <div class="skeleton-shimmer aspect-[4/3]"></div>
          <div class="p-5 space-y-3">
            <div class="skeleton-shimmer h-3 w-24 rounded"></div>
            <div class="skeleton-shimmer h-5 w-full rounded"></div>
            <div class="skeleton-shimmer h-4 w-full rounded"></div>
            <div class="skeleton-shimmer h-2.5 w-full rounded-full"></div>
            <div class="skeleton-shimmer h-10 w-full rounded-lg"></div>
          </div>
        </div>
      </div>

      <div v-else-if="stories.length === 0" class="empty-state">
        <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-500 mb-3">auto_stories</span>
        <p class="font-semibold text-slate-900 dark:text-white">No stories available yet.</p>
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="story in stories"
          :key="story.id"
          class="card-base overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
        >
          <div class="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
            <img
              v-if="story.cover_image"
              :src="story.cover_image"
              :alt="resolveTranslatedValue(story.title)"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-brand-primary/30 to-brand-primary"></div>
          </div>

          <div class="p-5 space-y-3">
            <span class="inline-block text-xs font-bold text-brand-primary uppercase tracking-wide">{{ story.patient_first_name }}'s Story</span>
            <h3 class="text-base font-bold text-slate-900 leading-snug line-clamp-2">{{ resolveTranslatedValue(story.title) }}</h3>
            <p class="text-sm text-slate-500 line-clamp-2 leading-relaxed">{{ story.content_excerpt }}</p>

            <div v-if="story.target_amount > 0" class="space-y-2 pt-1">
              <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  class="h-2.5 rounded-full bg-gradient-to-r from-brand-warm to-brand-primary transition-all duration-700"
                  :style="`width:${progress(story.collected_amount, story.target_amount)}%`"
                ></div>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-700">{{ fmt(story.collected_amount) }} raised</span>
                <span class="text-slate-400">of {{ fmt(story.target_amount) }}</span>
              </div>
            </div>

            <button
              class="btn-primary w-full rounded-xl"
              @click="router.push('/stories/' + story.id)"
            >Support Now</button>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
