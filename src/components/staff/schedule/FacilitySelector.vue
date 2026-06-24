<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  facilities: { type: Array, default: () => [] },
  selected: { type: Object, default: null },
})

const emit = defineEmits(['select'])
const { locale } = useI18n()
const open = ref(false)

const displayName = computed(() => {
  if (!props.selected) return 'Select Facility'
  if (locale.value === 'ar') return props.selected.name_ar || props.selected.name
  return props.selected.name
})

function toggle() {
  open.value = !open.value
}

function select(facility) {
  emit('select', facility)
  open.value = false
}
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-brand-primary/30 transition-all shadow-sm min-w-[180px]"
      @click="toggle"
    >
      <span class="material-symbols-outlined text-lg text-slate-400">location_on</span>
      <span class="flex-1 text-left truncate">{{ displayName }}</span>
      <span class="material-symbols-outlined text-base text-slate-400" :class="open ? 'rotate-180' : ''">expand_more</span>
    </button>

    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-40" @click="open = false"></div>
      <div
        v-if="open"
        class="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-elevated z-50 py-1.5 min-w-[220px]"
      >
        <button
          v-for="fac in facilities"
          :key="fac.uuid || fac.id"
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-colors"
          :class="selected?.uuid === fac.uuid ? 'text-brand-primary font-semibold bg-brand-primary/[0.03]' : 'text-slate-700 dark:text-slate-300'"
          @click="select(fac)"
        >
          <span class="material-symbols-outlined text-lg text-slate-400">business</span>
          <span>{{ locale === 'ar' ? fac.name_ar || fac.name : fac.name }}</span>
          <span v-if="selected?.uuid === fac.uuid" class="ml-auto material-symbols-outlined text-sm text-brand-primary">check</span>
        </button>
        <div v-if="facilities.length === 0" class="px-4 py-3 text-sm text-slate-400 text-center">
          No facilities available
        </div>
      </div>
    </Teleport>
  </div>
</template>
