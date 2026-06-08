<script setup>
import { useLandingData } from '../../composables/useLandingData';
import AppNavbar from '../../components/global/AppNavbar.vue';
import LandingHero from '../../components/landing/LandingHero.vue';
import LandingPlatformOverview from '../../components/landing/LandingPlatformOverview.vue';
import LandingTopFacilities from '../../components/landing/LandingTopFacilities.vue';
import LandingStories from '../../components/landing/LandingStories.vue';
import LandingArticles from '../../components/landing/LandingArticles.vue';
import LandingJobs from '../../components/landing/LandingJobs.vue';
import LandingHowItWorks from '../../components/landing/LandingHowItWorks.vue';
import LandingTopDoctors from '../../components/landing/LandingTopDoctors.vue';
import LandingAnnouncements from '../../components/landing/LandingAnnouncements.vue';
import LandingFooter from '../../components/landing/LandingFooter.vue';
import StatsCounterSection from '../../components/landing/StatsCounterSection.vue';
import FeaturedReviewsSlider from '../../components/landing/FeaturedReviewsSlider.vue';

const {
  loading,
  stats,
  categoryCounts,
  overview,
  platformStats,
  featuredReviews,
  topFacilities,
  stories,
  articles,
  jobs,
  doctors,
  announcements
} = useLandingData();
</script>

<template>
  <div class="min-h-screen bg-landing-cream dark:bg-slate-900 font-sans antialiased text-landing-dark">
    <AppNavbar variant="landing" />

    <main>
      <div data-aos="fade-up"><LandingHero :stats="stats" :loading="loading" /></div>
      <div data-aos="fade-up"><LandingAnnouncements :announcements="announcements" /></div>
      <div data-aos="fade-up"><LandingPlatformOverview :overview="overview" :loading="loading" /></div>
      <div data-aos="fade-up"><StatsCounterSection :stats="platformStats" :loading="loading" /></div>
      <div data-aos="fade-up"><LandingTopFacilities :facilities="topFacilities" :loading="loading" /></div>
      <div data-aos="fade-up"><LandingStories :stories="stories" :loading="loading" /></div>
      <div data-aos="fade-up"><LandingArticles :articles="articles" :loading="loading" /></div>
      <div data-aos="fade-up"><LandingJobs :jobs="jobs" :loading="loading" /></div>
      <div data-aos="fade-up"><LandingHowItWorks /></div>
      <div data-aos="fade-up"><LandingTopDoctors :doctors="doctors" :loading="loading" /></div>
      <div data-aos="fade-up"><FeaturedReviewsSlider :reviews="featuredReviews" :loading="loading" /></div>
    </main>

    <LandingFooter />
  </div>
</template>
