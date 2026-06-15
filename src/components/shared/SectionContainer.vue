<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  maxWidth: { type: String, default: 'max-w-7xl' },
  background: { type: String, default: '' },
  padding: { type: String, default: 'py-14 lg:py-16' },
  align: { type: String, default: 'left' },
})

const alignClass = computed(() => {
  if (props.align === 'center') return 'text-center'
  if (props.align === 'right') return 'text-right'
  return ''
})

const headerCenter = computed(() => props.align === 'center' ? 'mx-auto' : '')
</script>

<template>
  <section :class="[background, padding]">
    <div :class="[maxWidth, 'mx-auto px-4 sm:px-6 lg:px-8']">
      <div v-if="eyebrow || title || subtitle" :class="[alignClass, 'mb-10 lg:mb-12']">
        <span
          v-if="eyebrow"
          class="eyebrow-badge mb-4"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
          {{ eyebrow }}
        </span>
        <h2
          v-if="title"
          :class="[headerCenter, 'max-w-2xl text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight']"
        >{{ title }}</h2>
        <p
          v-if="subtitle"
          :class="[headerCenter, 'mt-3 text-base text-slate-500 dark:text-slate-400 max-w-2xl']"
        >{{ subtitle }}</p>
      </div>
      <slot />
    </div>
  </section>
</template>
