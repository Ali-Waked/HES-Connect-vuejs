<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 dark:bg-black/70 p-4 backdrop-blur-xs" @click.self="$emit('close')">
        <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Rate Your Experience</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">How was your appointment?</p>
          </div>

          <div class="px-6 py-5 space-y-5">
            <!-- Star Rating -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rating</label>
              <div class="flex items-center gap-1">
                <button
                  v-for="s in 5"
                  :key="s"
                  type="button"
                  class="cursor-pointer transition-transform hover:scale-110"
                  @click="rating = s"
                >
                  <svg class="w-8 h-8" :class="s <= rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                </button>
                <span class="ml-2 text-sm text-slate-500 dark:text-slate-400">{{ ratingLabel }}</span>
              </div>
            </div>

            <!-- Comment -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Review</label>
              <textarea
                v-model="content"
                rows="4"
                placeholder="Share your experience with this doctor..."
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition resize-none"
              />
            </div>

            <p v-if="submitError" class="text-sm text-red-500 dark:text-red-400">{{ submitError }}</p>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button class="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer" @click="$emit('close')">Cancel</button>
            <button
              class="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-dark transition cursor-pointer disabled:opacity-50"
              :disabled="!rating || submitting"
              @click="submit"
            >{{ submitting ? 'Submitting...' : 'Submit Review' }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createReview } from '@/services/reviewService'

const props = defineProps({
  show: Boolean,
  appointmentId: { type: [String, Number], default: '' }
})
const emit = defineEmits(['close', 'reviewed'])

const rating = ref(0)
const content = ref('')
const submitting = ref(false)
const submitError = ref('')

const ratingLabel = computed(() => {
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  return labels[rating.value] || ''
})

async function submit() {
  if (!rating.value || submitting.value) return
  submitting.value = true
  submitError.value = ''
  try {
    await createReview(props.appointmentId, {
      rating: rating.value,
      content: content.value,
    })
    emit('reviewed')
    emit('close')
  } catch (err) {
    submitError.value = err.response?.data?.message || 'Failed to submit review'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
.modal-leave-to > div {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>
