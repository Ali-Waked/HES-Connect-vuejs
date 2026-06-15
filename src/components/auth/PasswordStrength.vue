<script setup>
import { computed } from 'vue'
import { usePasswordStrength } from '@/composables/usePasswordStrength'

const props = defineProps({
  password: { type: String, default: '' },
  showCriteria: { type: Boolean, default: true },
})

const passwordRef = computed(() => props.password)
const { score, level, hasPassword, criteria } = usePasswordStrength(passwordRef)
</script>

<template>
  <div v-if="hasPassword" class="space-y-2">
    <div class="flex items-center gap-3">
      <div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :style="{
            width: level.width,
            backgroundColor: level.color,
          }"
        />
      </div>
      <span
        class="text-xs font-medium shrink-0"
        :style="{ color: level.color }"
      >
        {{ level.label }}
      </span>
    </div>

    <div v-if="showCriteria" class="grid grid-cols-2 gap-x-4 gap-y-1">
      <div
        v-for="item in criteria"
        :key="item.label"
        class="flex items-center gap-1.5 text-xs transition-colors duration-200"
        :class="item.met ? 'text-emerald-600' : 'text-slate-400'"
      >
        <svg v-if="item.met" class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
        {{ item.label }}
      </div>
    </div>
  </div>
</template>
