<script setup>
defineProps({
  review: { type: Object, required: true },
  showSource: { type: Boolean, default: false }
});

const initial = (name) => name?.charAt(0) || '?';

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl border border-landing-border dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-3 min-w-0">
        <div
          v-if="review.user_avatar"
          class="w-10 h-10 rounded-full bg-cover bg-center shrink-0"
          :style="{ backgroundImage: `url(${review.user_avatar})` }"
        />
        <div v-else class="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-sm shrink-0">
          {{ initial(review.user_name) }}
        </div>
        <div class="min-w-0">
          <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{{ review.user_name }}</h4>
          <p class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{{ fmtDate(review.date || review.created_at) }}</p>
        </div>
      </div>
      <div class="flex items-center gap-0.5 shrink-0">
        <svg v-for="s in 5" :key="s" class="w-3.5 h-3.5" :class="s <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-500'" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </div>
    </div>
    <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">"{{ review.comment }}"</p>
    <div v-if="showSource" class="mt-3 flex items-center gap-2">
      <ReviewSourceBadge :source="review.source" />
      <span v-if="review.facility_name" class="text-xs text-slate-400 dark:text-slate-500">at {{ review.facility_name }}</span>
      <span v-else-if="review.doctor_name" class="text-xs text-slate-400 dark:text-slate-500">about {{ review.doctor_name }}</span>
    </div>
  </div>
</template>
