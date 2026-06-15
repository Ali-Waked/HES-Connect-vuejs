<script setup>
import { useLandingData } from '../../composables/useLandingData';
import AppNavbar from '../../components/global/AppNavbar.vue';
import LandingHero from '../../components/landing/LandingHero.vue';
import LandingWhyChooseUs from '../../components/landing/LandingWhyChooseUs.vue';
import LandingHealthServices from '../../components/landing/LandingHealthServices.vue';
import LandingTopFacilities from '../../components/landing/LandingTopFacilities.vue';
import LandingArticles from '../../components/landing/LandingArticles.vue';
import LandingAboutPreview from '../../components/landing/LandingAboutPreview.vue';
import LandingContactCta from '../../components/landing/LandingContactCta.vue';
import LandingFooter from '../../components/landing/LandingFooter.vue';

const {
  loading,
  stats,
  categoryCounts,
  overview,
  platformStats,
  topFacilities,
  articles
} = useLandingData();
</script>

<template>
  <div class="min-h-screen bg-white font-sans antialiased text-slate-900">
    <AppNavbar variant="landing" />

    <main>
      <LandingHero :stats="stats" :loading="loading" />
      <LandingWhyChooseUs />
      <LandingHealthServices :category-counts="categoryCounts" :loading="loading" />
      <LandingTopFacilities :facilities="topFacilities" :loading="loading" />
      <LandingArticles :articles="articles" :loading="loading" />
      <LandingAboutPreview :overview="overview" :loading="loading" />
      <LandingContactCta />
    </main>

    <LandingFooter />
  </div>
</template>
