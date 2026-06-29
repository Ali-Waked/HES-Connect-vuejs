<script setup>
import AuthLabel from './AuthLabel.vue'

defineProps({
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
  icon: { type: String, default: '' },
  inputClass: { type: String, default: '' },
  dir: { type: String, default: '' },
})

defineEmits(['update:modelValue', 'blur', 'focus'])
</script>

<template>
  <div>
    <AuthLabel v-if="label" :for="id" :label="label" />
    <div class="relative">
        <div v-if="icon" class="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
          <slot name="icon">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
            </svg>
          </slot>
        </div>
        <input
          :id="id"
          :name="name"
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          :autocomplete="autocomplete"
          :disabled="disabled"
          :dir="dir || undefined"
          class="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="[
            error ? 'bg-red-50 dark:bg-red-900/20 focus:ring-red-200' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50',
            icon ? 'ps-10' : '',
            inputClass
          ]"
          @input="$emit('update:modelValue', $event.target.value)"
          @blur="$emit('blur', $event)"
          @focus="$emit('focus', $event)"
        />
        <p v-if="error" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          {{ error }}
        </p>
      </div>
    </div>
</template>
