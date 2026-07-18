<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '../../composables/useLocaleField'

const props = defineProps({
  comment: { type: Object, required: true },
  isOwner: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
  editText: { type: String, default: '' },
})

const emit = defineEmits([
  'update:editText',
  'edit',
  'cancelEdit',
  'saveEdit',
  'delete',
])

const { t } = useI18n()
const { localField } = useLocaleField()

const userName = computed(() => {
  if (props.comment.user_name) return props.comment.user_name
  if (props.comment.user?.name) return localField(props.comment.user, 'name') || props.comment.user.name
  return ''
})

const userAvatar = computed(() => {
  return props.comment.user_avatar || props.comment.user?.avatar || null
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(t('locale') === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function userInitial(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function handleConfirmDelete() {
  if (window.confirm(t('comment.confirmDeleteMessage'))) {
    emit('delete')
  }
}
</script>

<template>
  <div class="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
    <div class="shrink-0">
      <img
        v-if="userAvatar"
        :src="userAvatar"
        :alt="userName"
        class="w-10 h-10 rounded-full object-cover"
      />
      <div
        v-else
        class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400"
      >
        {{ userInitial(userName) }}
      </div>
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ userName }}</span>
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ formatDate(comment.created_at) }}</span>
      </div>

      <template v-if="editing">
        <textarea
          :value="editText"
          @input="emit('update:editText', $event.target.value)"
          rows="3"
          class="input-base resize-none px-4 py-3 mt-1"
        ></textarea>
        <div class="flex items-center gap-2 mt-2">
          <button
            class="btn-primary text-xs px-3 py-1.5"
            @click="emit('saveEdit')"
          >
            {{ t('comment.save') }}
          </button>
          <button
            class="btn-ghost text-xs px-3 py-1.5"
            @click="emit('cancelEdit')"
          >
            {{ t('comment.cancel') }}
          </button>
        </div>
      </template>

      <p v-else class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>

      <div v-if="isOwner && !editing" class="flex items-center gap-2 mt-2">
        <button
          class="text-xs font-medium text-brand-primary hover:underline cursor-pointer"
          @click="emit('edit')"
        >
          {{ t('comment.edit') }}
        </button>
        <span class="text-slate-300 dark:text-slate-600">|</span>
        <button
          class="text-xs font-medium text-danger hover:underline cursor-pointer"
          @click="handleConfirmDelete"
        >
          {{ t('comment.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>
