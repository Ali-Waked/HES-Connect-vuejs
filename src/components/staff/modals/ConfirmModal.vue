<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="close"></div>
    <div class="relative z-10 w-full max-w-md rounded-xl bg-white border border-slate-200 p-6 shadow-xl">
      <div class="flex items-start justify-between">
        <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
        <button class="text-slate-400 hover:text-slate-600" @click="close">✕</button>
      </div>
      <p class="mt-3 text-sm text-slate-600">{{ message }}</p>

      <div class="mt-6 flex justify-end gap-3">
        <button class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700" @click="cancel">{{ cancelText }}</button>
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
