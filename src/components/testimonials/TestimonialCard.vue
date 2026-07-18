<script setup>
import { useI18n } from 'vue-i18n'
import RatingStars from './RatingStars.vue'

const { t } = useI18n()

const props = defineProps({
  review: { type: Object, required: true },
})

function initial(name) {
  return name?.charAt(0) || '?'
}

function fmtDate(d) {
  if (!d) return ''
  const loc = document.documentElement.lang === 'ar' ? 'ar-SA' : 'en-US'
  return new Date(d).toLocaleDateString(loc, { year: 'numeric', month: 'short', day: 'numeric' })
}

function userRole(review) {
  if (review.user?.role) return review.user.role
  if (review.user_role) return review.user_role
  return ''
}
</script>

<template>
  <div class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
    <!-- Featured badge -->
    <div v-if="review.is_featured" class="absolute top-4 right-4">
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 shadow-sm">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        {{ t('testimonials.featured') }}
      </span>
    </div>

    <!-- User info -->
    <div class="flex items-start gap-3 mb-4">
      <div
        v-if="review.user?.avatar || review.user_avatar"
        class="w-12 h-12 rounded-full bg-cover bg-center shrink-0 ring-2 ring-brand-primary/10"
        :style="{ backgroundImage: `url(${review.user?.avatar || review.user_avatar})` }"
      />
      <div
        v-else
        class="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent text-white font-bold flex items-center justify-center text-lg shrink-0"
      >
        {{ initial(review.user?.name || review.user_name) }}
      </div>
      <div class="min-w-0 flex-1">
        <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">
          {{ review.user?.name || review.user_name }}
        </h4>
        <div class="flex items-center gap-2 mt-0.5">
          <span v-if="userRole(review)" class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">
            {{ userRole(review) }}
          </span>
          <span class="text-[11px] text-slate-400 dark:text-slate-500">
            {{ fmtDate(review.created_at) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Rating -->
    <div class="mb-3">
      <RatingStars :model-value="review.rating" :readonly="true" size="sm" />
    </div>

    <!-- Comment -->
    <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic flex-1">
      "{{ review.comment }}"
    </p>

    <!-- Admin reply -->
    <div v-if="review.admin_reply || review.reply" class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center">
          <svg class="w-3.5 h-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/>
          </svg>
        </div>
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ t('testimonials.adminReply') }}</span>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-8">
        {{ review.admin_reply || review.reply }}
      </p>
    </div>
  </div>
</template>
