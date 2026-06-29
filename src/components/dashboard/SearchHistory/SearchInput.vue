<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSearchHistory } from '../../../composables/useSearchHistory'

const props = defineProps({
  modelValue: { type: String, default: '' },
  type: { type: String, default: null },
  placeholder: { type: String, default: '' },
  debounceMs: { type: Number, default: 400 },
})

const emit = defineEmits(['update:modelValue', 'search'])

const { t } = useI18n()
const { logSearch } = useSearchHistory()

const inputValue = ref(props.modelValue)
let debounceTimer = null

watch(() => props.modelValue, (val) => {
  inputValue.value = val
})

function onInput(e) {
  inputValue.value = e.target.value
  emit('update:modelValue', inputValue.value)
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (inputValue.value.trim()) {
      logSearch(inputValue.value, props.type)
      emit('search', { query: inputValue.value, type: props.type })
    }
  }, props.debounceMs)
}

function onSubmit(e) {
  e.preventDefault()
  if (inputValue.value.trim()) {
    logSearch(inputValue.value, props.type)
    emit('search', { query: inputValue.value, type: props.type })
  }
}

function onClear() {
  inputValue.value = ''
  emit('update:modelValue', '')
  clearTimeout(debounceTimer)
}
</script>

<template>
  <form @submit="onSubmit" class="relative w-full" role="search">
    <svg
      class="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4.5 h-4.5 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      :value="inputValue"
      type="text"
      class="w-full pl-11 pr-10 rtl:pl-4 rtl:pr-11 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition"
      :placeholder="placeholder || t('searchHistory.searchPlaceholder')"
      @input="onInput"
      @keydown.enter.prevent="onSubmit"
      autocomplete="off"
    />
    <button
      v-if="inputValue"
      type="button"
      class="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded transition cursor-pointer"
      @click="onClear"
      :title="t('common.clear') || 'Clear'"
    >
      <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    </button>
    <button
      v-else
      type="submit"
      class="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary p-1 rounded transition cursor-pointer"
      :title="t('common.search') || 'Search'"
    >
      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6.5l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>
  </form>
</template>
