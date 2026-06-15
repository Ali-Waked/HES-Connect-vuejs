<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  articleId: { type: String, default: '' },
  commentText: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
  submitError: { type: String, default: '' },
})

const emit = defineEmits(['update:commentText', 'submit'])

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="card-base p-5">
    <template v-if="isAuthenticated">
      <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/>
        </svg>
        {{ t('articleDetail.addComment') }}
      </h4>
      <div class="relative">
        <textarea
          :value="commentText"
          @input="emit('update:commentText', $event.target.value)"
          :placeholder="t('articleDetail.commentPlaceholder')"
          rows="3"
          class="input-base resize-none px-4 py-3"
          :class="submitError ? 'border-danger' : ''"
        ></textarea>
        <p v-if="submitError" class="text-xs text-danger mt-1.5">{{ submitError }}</p>
      </div>
      <div class="flex items-center justify-between mt-3">
        <p class="text-xs text-slate-400 dark:text-slate-500">{{ commentText.length }} / 500</p>
        <button
          class="btn-primary"
          :disabled="submitting"
          @click="emit('submit')"
        >
          <span v-if="submitting" class="flex items-center gap-1.5">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"/></svg>
            {{ t('common.loading') }}
          </span>
          <span v-else>{{ t('articleDetail.submitComment') }}</span>
        </button>
      </div>
    </template>
    <template v-else>
      <div class="text-center py-6">
        <svg class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
        </svg>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">{{ t('articleDetail.loginToComment') }}</p>
        <button
          class="btn-primary"
          @click="goToLogin"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
          {{ t('articleDetail.login') }}
        </button>
      </div>
    </template>
  </div>
</template>
