<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import { usePublicToast } from '@/composables/usePublicToast'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  type: { type: String, default: '' },
  id: { type: [Number, String], default: '' },
  favoritableType: { type: String, default: '' },
  favoritableId: { type: [Number, String], default: '' },
  size: { type: String, default: 'md' },
})

const resolvedType = computed(() => props.type || props.favoritableType)
const resolvedId = computed(() => props.id || props.favoritableId)

const router = useRouter()
const authStore = useAuthStore()
const store = useFavoritesStore()
const { addToast } = usePublicToast()
const { t } = useI18n()

const isFav = computed(() => store.isFavorited(resolvedType.value, resolvedId.value))
const isBusy = computed(() => store.isToggling(resolvedType.value, resolvedId.value))

const sizeClasses = computed(() => ({
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-10 h-10',
}[props.size] || 'w-9 h-9'))

const iconSize = computed(() => ({
  sm: 'w-3.5 h-3.5',
  md: 'w-4.5 h-4.5',
  lg: 'w-5 h-5',
}[props.size] || 'w-4.5 h-4.5'))

function handleClick() {
  if (!authStore.authenticated) {
    addToast(t('favorites.loginRequired'), 'error')
    router.push('/login')
    return
  }
  store.toggleFavorite(resolvedType.value, resolvedId.value)
}
</script>

<template>
  <button
    class="inline-flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer select-none"
    :class="[
      sizeClasses,
      isBusy ? 'opacity-50 scale-90' : '',
      isFav
        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 shadow-sm shadow-red-500/10'
        : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-red-400 hover:scale-110 shadow-sm backdrop-blur-sm border border-slate-200 dark:border-slate-700',
    ]"
    :disabled="isBusy"
    :title="isFav ? 'Remove from favorites' : 'Add to favorites'"
    @click.stop="handleClick"
  >
    <svg
      v-if="isBusy"
      class="animate-spin"
      :class="iconSize"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <svg
      v-else
      :class="[iconSize, isFav ? 'fill-current' : 'fill-none']"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      class="transition-all duration-300"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  </button>
</template>
