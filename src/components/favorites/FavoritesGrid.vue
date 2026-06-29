<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import FavoriteCard from './FavoriteCard.vue'
import EmptyFavorites from './EmptyFavorites.vue'
import FavoritesFilter from './FavoritesFilter.vue'

const { t } = useI18n()
const store = useFavoritesStore()

const sentinel = ref(null)
let observer = null

onMounted(() => {
  store.loadFavorites(true)
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !store.loading && !store.loadingMore && store.hasMore) {
        store.loadMore()
      }
    },
    { rootMargin: '200px' }
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

function onFilterChange(val) {
  store.setFilter(val)
}
</script>

<template>
  <div class="space-y-6">
    <FavoritesFilter :model-value="store.filter" @update:model-value="onFilterChange" />

    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="n in 6" :key="n" class="card-base overflow-hidden animate-pulse">
        <div class="h-44 bg-slate-200 dark:bg-slate-700"></div>
        <div class="p-4 space-y-3">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <div v-else-if="store.error && store.favorites.length === 0" class="text-center py-16">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ store.error }}</p>
      <button
        class="mt-4 btn-primary"
        @click="store.loadFavorites(true)"
      >
        {{ t('common.retry') || 'Retry' }}
      </button>
    </div>

    <div v-else-if="store.filteredFavorites.length === 0" class="py-10">
      <EmptyFavorites />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <FavoriteCard
          v-for="fav in store.filteredFavorites"
          :key="fav.id"
          :item="fav"
        />
      </div>

      <div ref="sentinel" class="flex justify-center py-8">
        <div
          v-if="store.loadingMore"
          class="flex items-center gap-3 text-sm text-slate-400 dark:text-slate-500"
        >
          <svg class="w-5 h-5 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          {{ t('favorites.loading') }}
        </div>
        <div
          v-else-if="!store.hasMore && store.favorites.length > 0"
          class="text-xs text-slate-400 dark:text-slate-500"
        >
          {{ t('common.noResults') }}
        </div>
      </div>
    </template>
  </div>
</template>
