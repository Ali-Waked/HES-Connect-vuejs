<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'
import * as symptomService from '@/services/symptomService'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  facilityOnly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const { t, locale } = useI18n()

const open = ref(false)
const searchQuery = ref('')
const loading = ref(false)
const allSymptoms = ref([])

const selectedIds = computed({
  get: () => props.modelValue || [],
  set: (val) => emit('update:modelValue', val),
})

const filteredSymptoms = computed(() => {
  let list = allSymptoms.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(s => {
      const name = resolveTranslatedValue(s.name, locale.value).toLowerCase()
      return name.includes(q)
    })
  }
  return list
})

const selectedSymptoms = computed(() => {
  return allSymptoms.value.filter(s => selectedIds.value.includes(s.uuid || s.id))
})

function toggle(symptom) {
  const id = symptom.uuid || symptom.id
  const current = [...selectedIds.value]
  const idx = current.indexOf(id)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(id)
  }
  selectedIds.value = current
}

function remove(id) {
  const current = [...selectedIds.value]
  const idx = current.indexOf(id)
  if (idx >= 0) {
    current.splice(idx, 1)
    selectedIds.value = current
  }
}

function clearAll() {
  selectedIds.value = []
}

function onDocumentClick(e) {
  if (open.value) {
    open.value = false
  }
}

async function loadSymptoms() {
  loading.value = true
  try {
    const fetcher = props.facilityOnly ? symptomService.getFacilitySymptoms : symptomService.getSymptoms
    const { data } = await fetcher({ per_page: 1000, all: 1 })
    allSymptoms.value = data.data || data
  } catch {
    allSymptoms.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
  loadSymptoms()
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentClick)
})
</script>

<template>
  <div class="relative">
    <div
      class="w-full min-h-[42px] p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center flex-wrap gap-1.5 cursor-pointer transition hover:border-slate-300 dark:hover:border-slate-600"
      @click="open = !open"
    >
      <template v-if="selectedSymptoms.length > 0">
        <span
          v-for="s in selectedSymptoms"
          :key="s.uuid || s.id"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary"
          @click.stop="remove(s.uuid || s.id)"
        >
          {{ resolveTranslatedValue(s.name, locale) }}
          <svg class="w-3 h-3 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </span>
      </template>
      <span v-else class="text-slate-400 dark:text-slate-500">{{ placeholder || t('symptoms.selectSymptoms') || 'Select symptoms' }}</span>
      <div class="ml-auto flex items-center gap-1">
        <button
          v-if="selectedIds.length > 0"
          type="button"
          class="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition cursor-pointer"
          @click.stop="clearAll"
          :title="t('common.clear') || 'Clear'"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <svg class="w-4 h-4 shrink-0 text-slate-400 transition" :class="{ 'rotate-180': open }" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </div>
    </div>

    <Transition name="dropdown">
      <div v-if="open" class="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden" @mousedown.stop>
        <div class="p-2 border-b border-slate-100 dark:border-slate-700">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('common.search') || 'Search...'"
            class="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            autofocus
          />
        </div>
        <div class="max-h-48 overflow-y-auto">
          <div v-if="loading" class="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
            <svg class="w-4 h-4 inline-block mr-1.5 text-brand-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            {{ t('common.loading') || 'Loading...' }}
          </div>
          <button
            v-for="s in filteredSymptoms"
            :key="s.uuid || s.id"
            class="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-2"
            :class="{ 'bg-brand-primary/5 dark:bg-brand-primary/10': selectedIds.includes(s.uuid || s.id) }"
            @click="toggle(s)"
          >
            <div
              class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition"
              :class="selectedIds.includes(s.uuid || s.id) ? 'bg-brand-primary border-brand-primary' : 'border-slate-300 dark:border-slate-600'"
            >
              <svg v-if="selectedIds.includes(s.uuid || s.id)" class="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="flex-1">{{ resolveTranslatedValue(s.name, locale) }}</span>
          </button>
          <div v-if="!filteredSymptoms.length && !loading" class="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
            {{ t('common.noResults') || 'No results found' }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
