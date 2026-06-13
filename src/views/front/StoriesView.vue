<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getStories } from '../../api/public';
import AppNavbar from '../../components/global/AppNavbar.vue';
import LandingFooter from '../../components/landing/LandingFooter.vue';
import LandingSkeleton from '../../components/landing/LandingSkeleton.vue';

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
  <div class="min-h-screen bg-landing-cream font-sans antialiased text-landing-dark">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-28 lg:pt-32">
      <div data-aos="fade-up">
        <button
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
          @click="router.push('/')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
          Back to Home
        </button>

        <div class="max-w-2xl mb-10">
          <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Patient Stories</h1>
          <p class="text-slate-500 mt-2 text-lg">
            Real experiences from our community. Read their journeys and support those in need.
          </p>
        </div>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <LandingSkeleton variant="card" :count="6" />
      </div>

      <div v-else-if="stories.length === 0" class="text-center py-20 text-slate-500">
        <span class="material-symbols-outlined text-4xl text-slate-300 mb-3">auto_stories</span>
        <p class="font-semibold">No stories available yet.</p>
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(story, i) in stories"
          :key="story.id"
          data-aos="fade-up"
          :data-aos-delay="(i % 6) * 50"
          class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-primary/20 transition-all duration-200 group"
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
            <p class="text-sm text-slate-500 line-clamp-3 leading-relaxed">{{ story.content_excerpt }}</p>

            <div v-if="story.target_amount > 0" class="space-y-2 pt-1">
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
              @click="router.push('/stories/' + story.id)"
            >Support Now</button>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
