<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useFavoritesStore } from '@/stores/useFavoritesStore'
import { usePublicToast } from '@/composables/usePublicToast'

const props = defineProps({
  resourceType: { type: String, default: '' },
  resourceId: { type: [Number, String], default: '' },
  isFavorited: { type: Boolean, default: undefined },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:isFavorited', 'changed'])

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const favStore = useFavoritesStore()
const { addToast } = usePublicToast()

const localFav = ref(!!props.isFavorited)
const hasBackendProp = computed(() => props.isFavorited !== undefined)

watch(() => props.isFavorited, (val) => {
  if (val !== undefined) localFav.value = !!val
}, { immediate: true })

const storeIsFav = computed(() => favStore.isFavorited(props.resourceType, props.resourceId))

const isFav = computed(() => {
  if (hasBackendProp.value) return localFav.value
  return storeIsFav.value
})

const isBusy = computed(() => favStore.isToggling(props.resourceType, props.resourceId))

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

async function handleClick() {
  if (props.disabled || isBusy.value) return
  if (!authStore.authenticated) {
    addToast(t('favorites.loginRequired'), 'error')
    router.push('/login')
    return
  }
  const prev = isFav.value
  if (hasBackendProp.value) {
    localFav.value = !localFav.value
    emit('update:isFavorited', localFav.value)
  }
  try {
    await favStore.toggleFavorite(props.resourceType, props.resourceId)
    emit('changed', { type: props.resourceType, id: props.resourceId, isFavorited: !prev })
  } catch {
    if (hasBackendProp.value) {
      localFav.value = prev
      emit('update:isFavorited', prev)
    }
  }
}
</script>

<template>
  <button
    class="inline-flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer select-none"
    :class="[
      sizeClasses,
      isBusy ? 'opacity-50 scale-90' : '',
      disabled ? 'opacity-40 cursor-not-allowed' : '',
      isFav
        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-110 shadow-sm shadow-red-500/10'
        : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-red-400 hover:scale-110 shadow-sm backdrop-blur-sm border border-slate-200 dark:border-slate-700',
    ]"
    :disabled="isBusy || disabled"
    :title="isFav ? t('favorites.remove') || 'Remove from favorites' : t('favorites.add') || 'Add to favorites'"
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
