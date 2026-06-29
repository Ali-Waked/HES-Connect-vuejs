<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSearchHistory } from '../../composables/useSearchHistory'
import SearchInput from '../../components/dashboard/SearchHistory/SearchInput.vue'
import RecentSearchList from '../../components/dashboard/SearchHistory/RecentSearchList.vue'
import TrendingSearchList from '../../components/dashboard/SearchHistory/TrendingSearchList.vue'
import ConfirmModal from '../../components/dashboard/global/ConfirmModal.vue'

const router = useRouter()
const { t } = useI18n()
const { recentSearches, trendingSearches, loading, trendingLoading, fetchRecent, fetchTrending, clearHistory, saving } = useSearchHistory()

const searchQuery = ref('')
const showClearModal = ref(false)

onMounted(() => {
  fetchRecent()
  fetchTrending()
})

function onSearch({ query, type }) {
  searchQuery.value = query
}

function onSelectRecent(item) {
  searchQuery.value = item.query
}

function onSelectTrending(item) {
  searchQuery.value = item.query
}

function onClearHistory() {
  showClearModal.value = true
}

async function handleClearConfirm() {
  await clearHistory()
  showClearModal.value = false
}

function handleSearchSubmit() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/platform/search', query: { q: searchQuery.value.trim() } })
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ $t('searchHistory.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('searchHistory.subtitle') }}</p>
      </div>
    </div>

    <!-- Search Input -->
    <div class="max-w-2xl">
      <SearchInput
        v-model="searchQuery"
        :placeholder="$t('searchHistory.searchPlaceholder')"
        @search="onSearch"
      />
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Searches -->
      <div class="lg:col-span-2">
        <RecentSearchList
          :searches="recentSearches"
          :loading="loading"
          @select="onSelectRecent"
          @clear="onClearHistory"
        />
      </div>

      <!-- Trending Searches -->
      <div>
        <TrendingSearchList
          :trending="trendingSearches"
          :loading="trendingLoading"
          @select="onSelectTrending"
        />
      </div>
    </div>

    <ConfirmModal
      :show="showClearModal"
      :title="$t('searchHistory.clearTitle')"
      :message="$t('searchHistory.clearConfirm')"
      :confirm-text="$t('searchHistory.clearAll')"
      :is-danger="true"
      @confirm="handleClearConfirm"
      @close="showClearModal = false"
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
