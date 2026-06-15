<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { resolveTranslatedValue } from '@/utils/locale';

const props = defineProps({
  story: { type: Object, required: true }
});

const router = useRouter();
const store = useStoriesStore();

const related = computed(() =>
  store.stories.filter(s => props.story.relatedStories?.includes(s.id)) || []
);

const progress = (item) => {
  if (!item.isFundraising || item.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((item.collectedAmount / item.targetAmount) * 100));
};

const fmt = (n) => '$' + (n || 0).toLocaleString();

function go(id) { router.push('/stories/' + id); }
</script>

<template>
  <section v-if="related.length">
    <h3 class="text-lg font-bold text-slate-900 mb-4">Other Stories That Need Support</h3>
    <div class="flex gap-4 overflow-x-auto pb-2 snap-x">
      <div v-for="item in related" :key="item.id"
        class="min-w-[260px] flex-shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md snap-start">
        <div class="h-36 overflow-hidden rounded-t-xl bg-slate-100">
          <img v-if="item.images?.[0]" :src="item.images[0]" :alt="resolveTranslatedValue(item.title)" class="h-full w-full object-cover transition hover:scale-105 duration-300" />
          <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100">
            <span class="material-symbols-outlined text-4xl text-brand-primary/30">favorite</span>
          </div>
        </div>
        <div class="p-4 space-y-2">
          <p class="text-sm font-bold text-slate-900">{{ item.patientFirstName }}, {{ item.patientAge }}</p>
          <p class="text-xs text-slate-500 line-clamp-2">{{ item.content.split('\n')[0].slice(0, 100) }}...</p>
          <div v-if="item.isFundraising" class="space-y-1">
            <div class="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div class="h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all" :style="{ width: progress(item) + '%' }"></div>
            </div>
            <p class="text-xs text-slate-500">{{ fmt(item.collectedAmount) }} of {{ fmt(item.targetAmount) }}</p>
          </div>
          <button class="w-full rounded-lg bg-brand-primary py-2 text-xs font-bold text-white transition hover:bg-brand-primary-hover" @click="go(item.id)">Support Now</button>
        </div>
      </div>
    </div>
  </section>
</template>
