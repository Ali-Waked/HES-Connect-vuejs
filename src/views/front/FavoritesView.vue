<script setup>
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import PublicToastContainer from '@/components/global/PublicToastContainer.vue'
import FavoritesGrid from '@/components/favorites/FavoritesGrid.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <div class="relative hero-gradient overflow-hidden pt-28 lg:pt-32 pb-14 lg:pb-20">
      <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex items-center gap-2 text-sm text-white/60 mb-4">
          <router-link to="/" class="hover:text-white transition-colors">{{ t('nav.home') }}</router-link>
          <span class="text-white/40">/</span>
          <span class="text-white/80">{{ t('favorites.title') }}</span>
        </nav>
        <h1 class="text-3xl lg:text-4xl font-extrabold text-white leading-tight max-w-2xl">
          {{ t('favorites.title') }}
        </h1>
        <p class="text-white/60 mt-2 max-w-xl text-sm lg:text-base">
          {{ t('favorites.subtitle') }}
        </p>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div>
    </div>

    <main>
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8 lg:pt-10">
        <FavoritesGrid />
      </div>
    </main>

    <LandingFooter />
    <PublicToastContainer />
  </div>
</template>
