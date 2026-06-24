<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: String, default: '' },
  facilityType: { type: String, default: '' },
  facilityTypes: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'update:facilityType', 'search', 'clear'])

const { t } = useI18n()

function onSearchInput(e) {
  emit('update:modelValue', e.target.value)
}

function onSearchKeyup(e) {
  if (e.key === 'Enter') {
    emit('search')
  }
}

function onSearchClick() {
  emit('search')
}

function toggleFacilityType(val) {
  emit('update:facilityType', props.facilityType === val ? '' : val)
}

function onClear() {
  emit('clear')
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row gap-3 max-w-2xl">
      <div class="relative flex-1">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
        <input
          :value="modelValue"
          type="text"
          :placeholder="t('doctorsListing.searchPlaceholder')"
          class="w-full rounded-xl border border-white/20 bg-white/15 backdrop-blur-sm px-4 py-2.5 pl-10 text-sm text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30 transition"
          @input="onSearchInput"
          @keyup="onSearchKeyup"
        />
        <button
          v-if="modelValue"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white cursor-pointer"
          @click="emit('update:modelValue', ''); onSearchClick()"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <button
        class="text-white bg-brand-primary/90 dark:text-white rounded-xl px-5 py-2.5 font-bold text-sm shadow-sm hover:bg-brand-primary transition-all cursor-pointer"
        @click="onSearchClick"
      >
        <svg class="w-4 h-4 sm:mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
        <span class="hidden sm:inline">{{ t('common.search') }}</span>
      </button>
    </div>

    <div class="flex flex-wrap gap-2 mt-4">
      <span class="text-xs font-bold text-white/60 uppercase tracking-wider mr-1 self-center">{{ t('facilitiesListing.filters') }}</span>
      <button
        v-for="ft in facilityTypes"
        :key="ft.value"
        class="rounded-full px-3.5 py-1.5 text-xs font-bold border-2 transition-all cursor-pointer backdrop-blur-sm"
        :class="facilityType === ft.value
          ? 'bg-white text-brand-secondary border-white shadow-sm'
          : 'border-white/30 text-white/80 hover:border-white/60 hover:text-white'"
        @click="toggleFacilityType(ft.value)"
      >
        {{ t(ft.labelKey) }}
      </button>
    </div>

    <div v-if="modelValue || facilityType" class="mt-3 flex items-center gap-2 text-sm text-white/70">
      <span v-if="modelValue" class="rounded-full px-3 py-0.5 text-xs font-bold bg-white/20 text-white inline-flex items-center gap-1">
        "{{ modelValue }}"
      </span>
      <span v-if="facilityType" class="rounded-full px-3 py-0.5 text-xs font-bold bg-white/20 text-white inline-flex items-center gap-1">
        {{ t(facilityTypes.find(f => f.value === facilityType)?.labelKey || facilityType) }}
      </span>
      <button
        class="text-white/80 hover:text-white underline underline-offset-2 text-xs cursor-pointer"
        @click="onClear"
      >
        {{ t('doctorsListing.clearFilters') }}
      </button>
    </div>
  </div>
</template>
