<script setup>
import { ref, watch } from 'vue'
import { useMedicinesStore } from '@/stores/medicines'
import { useLocaleField } from '@/composables/useLocaleField'

const props = defineProps({
  modelValue: { type: [String, Object], default: null },
  placeholder: { type: String, default: 'Search for a medicine...' },
})

const emit = defineEmits(['update:modelValue'])

const store = useMedicinesStore()
const { localField } = useLocaleField()

const query = ref('')
const open = ref(false)
const highlightedIndex = ref(-1)

let debounceTimer = null

watch(query, (val) => {
  clearTimeout(debounceTimer)
  if (!val.trim()) {
    store.lookupResults = []
    open.value = false
    return
  }
  debounceTimer = setTimeout(async () => {
    await store.lookupMedicines(val.trim())
    open.value = true
    highlightedIndex.value = -1
  }, 350)
})

function select(item) {
  emit('update:modelValue', item)
  query.value = localField(item, 'name')
  open.value = false
}

function onBlur() {
  setTimeout(() => { open.value = false }, 200)
}

function onKeydown(e) {
  if (!open.value || !store.lookupResults.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, store.lookupResults.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
  } else if (e.key === 'Enter' && highlightedIndex.value >= 0) {
    e.preventDefault()
    select(store.lookupResults[highlightedIndex.value])
  } else if (e.key === 'Escape') {
    open.value = false
  }
}
</script>

<template>
  <div class="relative">
    <div class="relative">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        v-model="query"
        type="text"
        :placeholder="placeholder"
        autocomplete="off"
        @focus="query.trim() && store.lookupResults.length ? (open = true) : null"
        @blur="onBlur"
        @keydown="onKeydown"
        class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
      />
      <div v-if="store.lookupLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
        <svg class="w-4 h-4 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    </div>

    <div
      v-if="open && store.lookupResults.length > 0"
      class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
    >
      <ul class="max-h-60 overflow-y-auto py-1">
        <li
          v-for="(item, index) in store.lookupResults"
          :key="item.uuid || item.id"
          @mousedown.prevent="select(item)"
          class="px-4 py-2.5 flex items-center gap-3 text-sm cursor-pointer transition"
          :class="index === highlightedIndex ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
        >
          <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
            <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
            <span v-else class="material-symbols-outlined text-sm text-slate-400">medical_services</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold truncate">{{ localField(item, 'name') }}</p>
            <p v-if="localField(item, 'description')" class="text-xs text-slate-400 truncate">{{ localField(item, 'description') }}</p>
          </div>
        </li>
      </ul>
    </div>

    <div
      v-if="open && query.trim() && !store.lookupLoading && store.lookupResults.length === 0"
      class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 text-center"
    >
      <p class="text-sm text-slate-500 dark:text-slate-400">No medicines found</p>
    </div>
  </div>
</template>
