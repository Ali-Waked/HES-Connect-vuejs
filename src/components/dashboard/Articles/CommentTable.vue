<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseTable from '../global/BaseTable.vue'
import ConfirmModal from '../global/ConfirmModal.vue'

const props = defineProps({
  comments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['hide', 'show', 'delete'])

const { t } = useI18n()

const columns = computed(() => [
  { key: 'user', label: t('comment.user') },
  { key: 'comment', label: t('comment.comment') },
  { key: 'date', label: t('comment.date') },
  { key: 'status', label: t('comment.status') },
  { key: 'actions', label: t('comment.actions'), align: 'right' },
])

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(t('locale') === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function userInitial(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const isHidden = (comment) => {
  return comment.status === 'hidden' || comment.hidden === true
}
</script>

<template>
  <BaseTable
    :columns="columns"
    :items="comments"
    :loading="loading"
  >
    <template #cell(user)="{ item }">
      <div class="flex items-center gap-2.5">
        <img
          v-if="item.user_avatar"
          :src="item.user_avatar"
          :alt="item.user_name"
          class="w-8 h-8 rounded-full object-cover shrink-0"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0"
        >
          {{ userInitial(item.user_name) }}
        </div>
        <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ item.user_name }}</span>
      </div>
    </template>

    <template #cell(comment)="{ item }">
      <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 max-w-xs">{{ item.content }}</p>
    </template>

    <template #cell(date)="{ item }">
      <span class="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ formatDate(item.created_at) }}</span>
    </template>

    <template #cell(status)="{ item }">
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
        :class="isHidden(item)
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'"
      >
        {{ isHidden(item) ? t('comment.hidden') : t('comment.visible') }}
      </span>
    </template>

    <template #cell(actions)="{ item }">
      <div class="flex items-center justify-end gap-1">
        <button
          class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-primary transition cursor-pointer"
          :title="isHidden(item) ? t('comment.show') : t('comment.hide')"
          @click="emit(isHidden(item) ? 'show' : 'hide', item.id)"
        >
          <svg v-if="isHidden(item)" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path stroke-linecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        </button>
        <button
          class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-danger transition cursor-pointer"
          :title="t('comment.delete')"
          @click="emit('delete', item.id)"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </template>

    <template #empty>
      <div class="flex flex-col items-center justify-center py-10 gap-2">
        <svg class="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.97 5.97 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
        </svg>
        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ t('comment.noComments') }}</p>
      </div>
    </template>
  </BaseTable>
</template>
