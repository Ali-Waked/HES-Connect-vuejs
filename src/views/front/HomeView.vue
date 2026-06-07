<script setup>
import { useLandingData } from '../../composables/useLandingData';
import LandingNavbar from '../../components/landing/LandingNavbar.vue';
import LandingHero from '../../components/landing/LandingHero.vue';
import LandingCategories from '../../components/landing/LandingCategories.vue';
import LandingPlatformOverview from '../../components/landing/LandingPlatformOverview.vue';
import LandingTopFacilities from '../../components/landing/LandingTopFacilities.vue';
import LandingStories from '../../components/landing/LandingStories.vue';
import LandingArticles from '../../components/landing/LandingArticles.vue';
import LandingJobs from '../../components/landing/LandingJobs.vue';
import LandingHowItWorks from '../../components/landing/LandingHowItWorks.vue';
import LandingTopDoctors from '../../components/landing/LandingTopDoctors.vue';
import LandingAnnouncements from '../../components/landing/LandingAnnouncements.vue';
import LandingFooter from '../../components/landing/LandingFooter.vue';

const {
  loading,
  stats,
  categoryCounts,
  overview,
  topFacilities,
  stories,
  articles,
  jobs,
  doctors,
  announcements
} = useLandingData();
</script>

<template>
  <div class="min-h-screen bg-landing-cream font-sans antialiased text-landing-dark">
    <LandingNavbar />

    <main>
      <LandingHero :stats="stats" :loading="loading" />
      <LandingAnnouncements :announcements="announcements" />
      <LandingCategories :counts="categoryCounts" :loading="loading" />
      <LandingPlatformOverview :overview="overview" :loading="loading" />
      <LandingTopFacilities :facilities="topFacilities" :loading="loading" />
      <LandingStories :stories="stories" :loading="loading" />
      <LandingArticles :articles="articles" :loading="loading" />
      <LandingJobs :jobs="jobs" :loading="loading" />
      <LandingHowItWorks />
      <LandingTopDoctors :doctors="doctors" :loading="loading" />
    </main>

    <LandingFooter />
  </div>
</template>
