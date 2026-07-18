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
  <div class="max-w-3xl">
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        <input
          :value="modelValue"
          type="text"
          :placeholder="t('doctorsListing.searchPlaceholder')"
          class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition shadow-sm"
          @input="onSearchInput"
          @keyup="onSearchKeyup"
        />
        <button
          v-if="modelValue"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
          @click="emit('update:modelValue', ''); onSearchClick()"
        >
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
      <button
        class="px-6 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary-hover transition shadow-sm cursor-pointer"
        @click="onSearchClick"
      >
        <span class="material-symbols-outlined text-lg sm:mr-1.5 align-middle">search</span>
        <span class="hidden sm:inline">{{ t('common.search') }}</span>
      </button>
    </div>

    <div class="flex flex-wrap gap-2 mt-4">
      <button
        v-for="ft in facilityTypes"
        :key="ft.value"
        class="rounded-full px-4 py-2 text-xs font-bold border transition-all cursor-pointer"
        :class="facilityType === ft.value
          ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-brand-primary/40 hover:text-brand-primary bg-white dark:bg-slate-800'"
        @click="toggleFacilityType(ft.value)"
      >
        {{ t(ft.labelKey) }}
      </button>
    </div>

    <div v-if="modelValue || facilityType" class="mt-3 flex items-center gap-2 text-sm">
      <span v-if="modelValue" class="inline-flex items-center gap-1 px-3 py-0.5 text-xs font-bold bg-brand-primary/10 text-brand-primary rounded-full">
        "{{ modelValue }}"
        <button class="hover:text-brand-primary-hover cursor-pointer" @click="emit('update:modelValue', ''); onSearchClick()">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </span>
      <span v-if="facilityType" class="inline-flex items-center gap-1 px-3 py-0.5 text-xs font-bold bg-brand-primary/10 text-brand-primary rounded-full">
        {{ t(facilityTypes.find(f => f.value === facilityType)?.labelKey || facilityType) }}
        <button class="hover:text-brand-primary-hover cursor-pointer" @click="emit('update:facilityType', '')">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </span>
      <button
        class="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary underline underline-offset-2 cursor-pointer"
        @click="onClear"
      >
        {{ t('doctorsListing.clearFilters') }}
      </button>
    </div>
  </div>
</template>
