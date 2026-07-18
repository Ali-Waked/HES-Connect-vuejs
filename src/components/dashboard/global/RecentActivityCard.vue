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
      if (typeof parsed === 'object' && parsed !== null) return parsed[locale.value] || parsed.en || parsed.ar || '';
    } catch {}
    return val;
  }
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object' && val !== null) {
    if (Array.isArray(val)) return val.map(v => extractText(v)).join(', ');
    if (val.en || val.ar || val[locale.value]) return val[locale.value] || val.en || val.ar || '';
    if (val.name) return extractText(val.name);
    if (val.title) return extractText(val.title);
    return Object.values(val).map(v => extractText(v)).join(' ');
  }
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
  users: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', dot: 'bg-blue-500' },
  facilities: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', dot: 'bg-amber-500' },
  articles: { text: 'text-brand-primary dark:text-brand-primary', bg: 'bg-brand-primary/10', dot: 'bg-brand-primary' },
  appointments: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  reviews: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', dot: 'bg-amber-500' },
  prescriptions: { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', dot: 'bg-violet-500' },
  donations: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', dot: 'bg-rose-500' },
  jobs: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10', dot: 'bg-cyan-500' },
};

function getColor(key) {
  return colorMap[key.toLowerCase()] || { text: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700/50', dot: 'bg-slate-400' };
}
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-card overflow-hidden">
    <template v-for="(items, sectionKey) in sections" :key="sectionKey">
      <template v-if="Array.isArray(items) && items.length">
        <!-- Section title -->
        <div class="flex items-center gap-2.5 px-6 pt-5 pb-3">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" :class="getColor(sectionKey).bg">
            <span class="material-symbols-outlined text-[14px]" :class="getColor(sectionKey).text">
              {{ getIcon(sectionKey) }}
            </span>
          </div>
          <h4 class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider capitalize">
            {{ String(sectionKey).replace(/_/g, ' ') }}
          </h4>
          <span class="ms-auto text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded-full">
            {{ items.length }}
          </span>
        </div>

        <!-- Items -->
        <div class="px-6 pb-5 space-y-1">
          <div
            v-for="(item, idx) in items"
            :key="idx"
            class="flex items-start gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group/item"
          >
            <!-- Dot indicator -->
            <div class="mt-1.5 w-2 h-2 rounded-full shrink-0" :class="getColor(sectionKey).dot" />

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {{ extractText(item.title) || extractText(item) }}
              </p>
              <p v-if="extractText(item.description)" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed truncate">
                {{ extractText(item.description) }}
              </p>
            </div>

            <!-- Time stamp -->
            <span v-if="extractText(item.time)" class="shrink-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">
              {{ extractText(item.time) }}
            </span>
          </div>
        </div>

        <!-- Divider -->
        <div
          v-if="sectionKeys.indexOf(sectionKey) < sectionKeys.length - 1"
          class="mx-6 h-px bg-slate-50 dark:bg-slate-700"
        />
      </template>
    </template>
  </div>
</template>
