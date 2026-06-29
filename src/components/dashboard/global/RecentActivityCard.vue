<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const props = defineProps({
  sections: { type: Object, required: true }
});

const sectionKeys = computed(() => {
  const keys = Object.keys(props.sections);
  return keys.filter(k => Array.isArray(props.sections[k]) && props.sections[k].length);
});

function extractText(val) {
  if (!val && val !== 0) return '';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object') return parsed[locale.value] || parsed.en || parsed.ar || '';
    } catch {}
    return val;
  }
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return val[locale.value] || val.en || val.ar || val.name || '';
  return '';
}

const iconMap = {
  users: 'person_add',
  facilities: 'home_health',
  articles: 'article',
  appointments: 'calendar_month',
  reviews: 'star',
  prescriptions: 'description',
  donations: 'volunteer_activism',
  jobs: 'work',
};

function getIcon(key) {
  return iconMap[key.toLowerCase()] || 'circle';
}

const colorMap = {
  users: 'text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
  facilities: 'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  articles: 'text-brand-primary bg-brand-primary/10 dark:text-brand-primary dark:bg-brand-primary/10',
  appointments: 'text-emerald-500 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  reviews: 'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  prescriptions: 'text-violet-500 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/30',
  donations: 'text-rose-500 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30',
  jobs: 'text-cyan-500 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/30',
};

function getColor(key) {
  return colorMap[key.toLowerCase()] || 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700/50';
}
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
    <template v-for="(items, sectionKey) in sections" :key="sectionKey">
      <div class="px-6 pt-5 pb-2">
        <h4 class="text-sm font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
          <span class="material-symbols-outlined text-base" :class="getColor(sectionKey).split(' ')[0]">
            {{ getIcon(sectionKey) }}
          </span>
          {{ sectionKey.replace(/_/g, ' ') }}
        </h4>
      </div>
      <div class="px-6 pb-4 space-y-3">
        <div
          v-for="(item, idx) in items"
          :key="idx"
          class="flex items-start gap-3"
        >
          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="getColor(sectionKey)">
            <span class="material-symbols-outlined text-sm">{{ extractText(item.icon) || 'circle' }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ extractText(item.title) || extractText(item) }}</p>
            <p v-if="extractText(item.description)" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ extractText(item.description) }}</p>
            <p v-if="extractText(item.time)" class="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase">{{ extractText(item.time) }}</p>
          </div>
        </div>
      </div>
      <div v-if="sectionKeys.indexOf(sectionKey) < sectionKeys.length - 1" class="mx-6 h-px bg-slate-50 dark:bg-slate-700" />
    </template>
  </div>
</template>
