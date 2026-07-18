<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import FavoriteCard from '@/components/favorites/FavoriteCard.vue'
import EmptyFavorites from '@/components/favorites/EmptyFavorites.vue'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import PublicToastContainer from '@/components/global/PublicToastContainer.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const store = useFavoritesStore()

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'facility', label: 'Facilities' },
  { key: 'article', label: 'Articles' },
  { key: 'story', label: 'Stories' },
  { key: 'staff', label: 'Staff' },
  { key: 'job', label: 'Jobs' },
]

onMounted(() => {
  store.loadFavorites()
})

function onFilterChange(key) {
  store.setFilter(key)
}
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-28 lg:pt-32">
      <!-- Hero Section -->
      <div class="text-center mb-10">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {{ t('favorites.title') }}
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {{ t('favorites.subtitle') }}
        </p>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 mb-8 overflow-x-auto justify-center">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          class="px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition cursor-pointer"
          :class="store.filter === tab.key
            ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/15'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
          @click="onFilterChange(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
          <div class="aspect-[4/3] bg-slate-200 dark:bg-slate-700"></div>
          <div class="p-5 space-y-3">
            <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="store.error" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
        </div>
        <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ t('favorites.emptyTitle') }}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ store.error }}</p>
        <button class="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition cursor-pointer" @click="store.loadFavorites">
          {{ t('common.retry') || 'Retry' }}
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="store.filteredFavorites.length === 0" class="py-10">
        <EmptyFavorites />
      </div>

      <!-- Cards Grid -->
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FavoriteCard
            v-for="fav in store.filteredFavorites"
            :key="fav.id"
            :item="fav"
          />
        </div>

        <!-- Load More -->
        <div class="flex justify-center py-10" v-if="store.total > store.filteredFavorites.length">
          <button
            :disabled="store.loading"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
            @click="store.loadMore"
          >
            <svg v-if="store.loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ t('favorites.loadMore') || 'Load More' }}
          </button>
        </div>
      </template>
    </main>

    <LandingFooter />
    <PublicToastContainer />
  </div>
</template>
