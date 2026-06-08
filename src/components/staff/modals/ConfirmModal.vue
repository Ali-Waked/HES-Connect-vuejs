<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="close"></div>
    <div class="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-xl">
      <div class="flex items-start justify-between">
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ title }}</h3>
        <button class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" @click="close">✕</button>
      </div>
      <p class="mt-3 text-sm text-slate-600 dark:text-slate-400">{{ message }}</p>

      <div class="mt-6 flex justify-end gap-3">
        <button class="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300" @click="cancel">{{ cancelText }}</button>
        <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="confirmAction">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watchEffect } from 'vue'
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' }
})
const emit = defineEmits(['update:modelValue','confirm','cancel'])

const visible = props.modelValue

function close() { emit('update:modelValue', false); emit('cancel') }
function cancel() { emit('update:modelValue', false); emit('cancel') }
function confirmAction() { emit('update:modelValue', false); emit('confirm') }

watchEffect(() => {
  // reactive passthrough (no-op but keeps linter happy)
  void props.modelValue
})
</script>

<style scoped>
</style>
