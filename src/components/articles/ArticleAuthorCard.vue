<script setup>
import { computed } from 'vue'
import { useLocaleField } from '../../composables/useLocaleField'
import { useI18n } from 'vue-i18n'
import { getInitials } from '../../utils/locale'

const props = defineProps({
  author: { type: Object, default: null },
})

const { localField } = useLocaleField()
const { t } = useI18n()

const authorInitial = computed(() => getInitials(props.author?.name))

const hasAvatar = computed(() => !!props.author?.avatar)
</script>

<template>
  <div class="flex items-start gap-4 p-5 card-base">
    <div class="shrink-0">
      <img
        v-if="hasAvatar"
        :src="author.avatar"
        :alt="localField(author, 'name')"
        class="w-14 h-14 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm"
      />
      <div
        v-else
        class="w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-sm font-bold text-white shadow-sm"
      >
        {{ authorInitial }}
      </div>
    </div>
    <div class="min-w-0 flex-1">
      <h4 class="text-base font-bold text-slate-900 dark:text-white">
        {{ localField(author, 'name') }}
      </h4>
      <p v-if="localField(author, 'specialization')" class="text-sm text-brand-primary font-medium mt-0.5">
        {{ localField(author, 'specialization') }}
      </p>
      <p v-if="localField(author, 'bio')" class="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
        {{ localField(author, 'bio') }}
      </p>
    </div>
  </div>
</template>
