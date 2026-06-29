<script setup>
import { computed } from 'vue'
import FavoriteButton from '@/components/common/FavoriteButton.vue'

const props = defineProps({
  type: { type: String, default: '' },
  id: { type: [Number, String], default: '' },
  favoritableType: { type: String, default: '' },
  favoritableId: { type: [Number, String], default: '' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  isFavorited: { type: Boolean, default: undefined },
})

const emit = defineEmits(['update:isFavorited', 'changed'])

const resourceType = computed(() => props.type || props.favoritableType)
const resourceId = computed(() => props.id || props.favoritableId)
</script>

<template>
  <FavoriteButton
    :resource-type="resourceType"
    :resource-id="resourceId"
    :is-favorited="isFavorited"
    :size="size"
    :disabled="disabled"
    @update:is-favorited="emit('update:isFavorited', $event)"
    @changed="emit('changed', $event)"
  />
</template>
