<script setup>
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '../../../composables/useLocaleField'
import BaseBadge from '../global/BaseBadge.vue'
import { resolveTranslatedValue } from '../../../utils/locale'

const props = defineProps({
  user: { type: Object, required: true },
})

const { locale } = useI18n()
const { localField } = useLocaleField()
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <svg class="w-4 h-4 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
        </svg>
        Personal Information
      </h3>
    </div>
    <div class="divide-y divide-slate-50 dark:divide-slate-800">
      <div v-for="(row, i) in [
        { label: 'Name (English)', value: resolveTranslatedValue(user?.name, 'en') },
        { label: 'Name (Arabic)', value: resolveTranslatedValue(user?.name, 'ar') },
        { label: 'Email', value: user?.email },
        { label: 'Provider', value: user?.provider || '—' },
        { label: 'Last Seen', value: user?.last_seen_at || '—' },
        { label: 'Role', value: user?.role, badge: true },
        { label: 'City', value: resolveTranslatedValue(user?.city?.name) || '—' },
      ]" :key="i" class="flex items-center gap-4 px-6 py-3.5">
        <dt class="w-36 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ row.label }}</dt>
        <dd class="text-sm text-slate-800 dark:text-slate-200 min-w-0">
          <BaseBadge v-if="row.badge && row.value" variant="primary">{{ localField(row.value, 'name') }}</BaseBadge>
          <template v-else>{{ row.value }}</template>
        </dd>
      </div>
    </div>
  </div>
</template>
