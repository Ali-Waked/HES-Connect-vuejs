<script setup>
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'

defineProps({
  departments: { type: Array, default: () => [] }
})

const { locale } = useI18n()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <span
      v-for="dept in departments"
      :key="dept.uuid"
      class="inline-flex items-center px-3 py-1.5 bg-brand-primary-lighter dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary-light rounded-lg text-xs font-bold"
    >
      {{ resolveTranslatedValue(dept.name, locale.value) }}
    </span>
    <span
      v-if="departments.length === 0"
      class="text-sm text-slate-400 dark:text-slate-500"
    >
      {{ $t('common.noData') }}
    </span>
  </div>
</template>
