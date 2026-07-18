<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'

const CATEGORY_COLORS = {
  'Emergency Relief': { bg: 'bg-rose-500/10', text: 'text-rose-600', darkBg: 'dark:bg-rose-500/20', darkText: 'dark:text-rose-400' },
  'Emergency Medicine': { bg: 'bg-rose-500/10', text: 'text-rose-600', darkBg: 'dark:bg-rose-500/20', darkText: 'dark:text-rose-400' },
}

function getCategoryColor(nameObj) {
  if (!nameObj) return null
  const names = typeof nameObj === 'string' ? [nameObj] : Object.values(nameObj)
  for (const n of names) {
    const c = CATEGORY_COLORS[n]
    if (c) return c
  }
  return null
}

const props = defineProps({
  category: { type: [Object, null], default: null },
  size: { type: String, default: 'sm' },
})

const { locale } = useI18n()

const name = computed(() => {
  if (!props.category) return ''
  return resolveTranslatedValue(props.category.name, locale.value)
})

const colorClasses = computed(() => {
  if (!props.category) return {}
  const c = getCategoryColor(props.category.name)
  if (c) return c
  return {
    bg: 'bg-brand-primary/10',
    text: 'text-brand-primary',
    darkBg: 'dark:bg-brand-primary/20',
    darkText: 'dark:text-brand-primary-light',
  }
})

const sizeClasses = computed(() => ({
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
})[props.size] || 'px-2 py-0.5 text-xs')
</script>

<template>
  <span
    v-if="category && name"
    class="inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap"
    :class="[sizeClasses, colorClasses.bg, colorClasses.text, colorClasses.darkBg, colorClasses.darkText]"
  >
    <svg class="shrink-0" :class="size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
    </svg>
    {{ name }}
  </span>
</template>
