<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserReviewStore } from '@/stores/userReview'
import { usePublicToast } from '@/composables/usePublicToast'
import RatingStars from './RatingStars.vue'

const { t } = useI18n()
const store = useUserReviewStore()
const { addToast } = usePublicToast()

const emit = defineEmits(['submitted'])

const rating = ref(0)
const comment = ref('')
const validationErrors = ref({})

const isEditing = computed(() => store.hasReview)

watch(() => store.review, (review) => {
  if (review) {
    rating.value = review.rating || 0
    comment.value = review.comment || ''
  }
}, { immediate: true })

function validate() {
  const errs = {}
  if (rating.value === 0) errs.rating = t('testimonials.ratingRequired')
  if (!comment.value.trim()) errs.comment = t('testimonials.commentRequired')
  else if (comment.value.trim().length < 10) errs.comment = t('testimonials.commentMinLength')
  else if (comment.value.trim().length > 1000) errs.comment = t('testimonials.commentMaxLength')
  validationErrors.value = errs
  return Object.keys(errs).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  const result = await store.submitReview({
    rating: rating.value,
    comment: comment.value.trim(),
  })
  if (result.success) {
    addToast(isEditing.value ? t('testimonials.updatedSuccess') : t('testimonials.createdSuccess'))
    emit('submitted')
  } else {
    if (result.errors) {
      validationErrors.value = result.errors
    }
    addToast(result.error || t('testimonials.submitError'), 'error')
  }
}

async function handleDelete() {
  const result = await store.deleteReview()
  if (result.success) {
    rating.value = 0
    comment.value = ''
    addToast(t('testimonials.deletedSuccess'))
    emit('submitted')
  } else {
    addToast(result.error || t('testimonials.deleteError'), 'error')
  }
}
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm relative overflow-hidden">
    <!-- Decorative gradient -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary"></div>

    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">
      {{ isEditing ? t('testimonials.updateTitle') : t('testimonials.createTitle') }}
    </h3>
    <p v-if="isEditing" class="text-sm text-brand-primary font-medium mb-1">
      {{ t('testimonials.hasReviewNotice') }}
    </p>
    <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
      {{ isEditing ? t('testimonials.updateDesc') : t('testimonials.createDesc') }}
    </p>

    <!-- Disabled state -->
    <div v-if="!store.canReview && store.canReviewReason" class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-3">
      <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
      </svg>
      <div>
        <p class="text-sm font-medium text-slate-600 dark:text-slate-300">{{ t('testimonials.cannotReview') }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ store.canReviewReason }}</p>
      </div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {{ t('testimonials.yourRating') }}
        </label>
        <RatingStars v-model="rating" size="lg" :show-value="true" />
        <p v-if="validationErrors.rating" class="mt-1.5 text-xs text-red-500">{{ validationErrors.rating }}</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {{ t('testimonials.yourComment') }}
        </label>
        <textarea
          v-model="comment"
          :placeholder="t('testimonials.commentPlaceholder')"
          rows="4"
          maxlength="1000"
          class="input-base resize-none"
          :class="{ 'ring-2 ring-red-300 border-red-300': validationErrors.comment }"
        ></textarea>
        <div class="flex justify-between items-center mt-1.5">
          <p v-if="validationErrors.comment" class="text-xs text-red-500">{{ validationErrors.comment }}</p>
          <p v-else class="text-xs text-slate-400">{{ comment.length }} / 1000</p>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button
          type="submit"
          :disabled="store.submitting"
          class="btn-primary px-6 py-2.5"
        >
          <svg v-if="store.submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          {{ store.submitting ? t('testimonials.submitting') : (isEditing ? t('testimonials.updateReview') : t('testimonials.submitReview')) }}
        </button>

        <button
          v-if="isEditing"
          type="button"
          :disabled="store.submitting"
          class="px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer disabled:opacity-50"
          @click="handleDelete"
        >
          {{ t('testimonials.deleteReview') }}
        </button>
      </div>
    </form>
  </div>
</template>
