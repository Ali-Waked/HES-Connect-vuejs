<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['update:search', 'update:category', 'update:tag', 'update:sort'])

const props = defineProps({
  categories: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  search: { type: String, default: '' },
  category: { type: String, default: '' },
  tag: { type: String, default: '' },
  sort: { type: String, default: 'latest' },
  loading: { type: Boolean, default: false }
})

const { t } = useI18n()

const localSearch = ref(props.search)
const localCategory = ref(props.category)
const localTag = ref(props.tag)
const localSort = ref(props.sort)
let debounceTimer = null

watch(localSearch, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:search', val)
  }, 400)
})

watch(localCategory, (val) => emit('update:category', val))
watch(localTag, (val) => emit('update:tag', val))
watch(localSort, (val) => emit('update:sort', val))

function resetFilters() {
  localSearch.value = ''
  localCategory.value = ''
  localTag.value = ''
  localSort.value = 'latest'
}

const hasActiveFilters = ref(false)
watch([localSearch, localCategory, localTag, localSort], ([s, c, tg, so]) => {
  hasActiveFilters.value = !!(s || c || tg || so !== 'latest')
})
</script>

<template>
  <div class="card-base p-4 lg:p-5">
    <div class="flex flex-col lg:flex-row gap-3 lg:items-center">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
        </svg>
        <input
          v-model="localSearch"
          type="text"
          :placeholder="t('articlesListing.searchPlaceholder')"
          class="input-base pl-10 pr-10"
        />
        <button
          v-if="localSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          @click="localSearch = ''"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="flex flex-wrap gap-3">
        <div class="relative">
          <select
            v-model="localCategory"
            class="appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none cursor-pointer min-w-[160px]"
          >
            <option value="">{{ t('articlesListing.filterCategory') }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
              {{ cat.name?.en || cat.name }}
            </option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
        </div>

        <div class="relative">
          <select
            v-model="localTag"
            class="appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none cursor-pointer min-w-[140px]"
          >
            <option value="">{{ t('articlesListing.filterTag') }}</option>
            <option v-for="tag in tags" :key="tag.id" :value="tag.slug">
              {{ tag.name?.en || tag.name }}
            </option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
        </div>

        <div class="relative">
          <select
            v-model="localSort"
            class="appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 pr-10 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none cursor-pointer min-w-[150px]"
          >
            <option value="latest">{{ t('articlesListing.sortLatest') }}</option>
            <option value="views">{{ t('articlesListing.sortViews') }}</option>
            <option value="comments">{{ t('articlesListing.sortComments') }}</option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
        </div>
      </div>
    </div>

    <div v-if="hasActiveFilters" class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <p class="text-xs text-slate-500 dark:text-slate-400">
        <span v-if="localSearch" class="inline-flex items-center gap-1 mr-3">
          "{{ localSearch }}"
        </span>
      </p>
      <button
        class="text-xs font-medium text-brand-primary hover:text-brand-primary-hover cursor-pointer transition"
        @click="resetFilters"
      >
        {{ t('common.resetFilters') }}
      </button>
    </div>
  </div>
</template>
