<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCategories } from '@/composables/useCategories'
import { resolveTranslatedValue } from '@/utils/locale'

const props = defineProps({
  modelValue: { type: [String, Number, null], default: null },
  type: { type: String, default: 'story' },
  placeholder: { type: String, default: '' },
  includeAll: { type: Boolean, default: false },
  allLabel: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const { t, locale } = useI18n()
const { categories, loading, fetchCategories } = useCategories()

const searchQuery = ref('')
const open = ref(false)

const filteredCategories = computed(() => {
  let list = categories.value.filter(c => c.type === props.type)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => {
      const name = resolveTranslatedValue(c.name, locale.value).toLowerCase()
      return name.includes(q)
    })
  }
  return list
})

const selectedName = computed(() => {
  if (!props.modelValue) return ''
  const cat = categories.value.find(c => c.id == props.modelValue || c.uuid == props.modelValue)
  return cat ? resolveTranslatedValue(cat.name, locale.value) : ''
})

function select(cat) {
  emit('update:modelValue', cat.uuid || cat.id)
  open.value = false
  searchQuery.value = ''
}

function clear() {
  emit('update:modelValue', null)
  open.value = false
  searchQuery.value = ''
}

function toggle() {
  open.value = !open.value
  if (open.value) searchQuery.value = ''
}

function close() {
  open.value = false
  searchQuery.value = ''
}

function onDocumentClick(e) {
  if (open.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
  fetchCategories({ type: props.type, per_page: 100 })
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentClick)
})
</script>

<template>
  <div class="relative">
    <div
      class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-between gap-2 cursor-pointer transition hover:border-slate-300 dark:hover:border-slate-600"
      @click="toggle"
    >
      <span v-if="selectedName" class="truncate">{{ selectedName }}</span>
      <span v-else class="text-slate-400 dark:text-slate-500 truncate">{{ placeholder || t('common.select') || 'Select' }}</span>
      <svg class="w-4 h-4 shrink-0 text-slate-400 transition" :class="{ 'rotate-180': open }" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
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
          <button
            v-if="includeAll"
            type="button"
            class="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            @click="clear"
          >{{ allLabel || t('common.all') || 'All' }}</button>
          <button
            v-for="cat in filteredCategories"
            :key="cat.uuid || cat.id"
            type="button"
            class="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            :class="{ 'bg-brand-primary/5 dark:bg-brand-primary/10 font-semibold': (cat.uuid || cat.id) == modelValue }"
            @click="select(cat)"
          >{{ resolveTranslatedValue(cat.name, locale) }}</button>
          <div v-if="!filteredCategories.length && !loading" class="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
            {{ t('common.noResults') || 'No results found' }}
          </div>
          <div v-if="loading" class="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
            {{ t('common.loading') || 'Loading...' }}
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
