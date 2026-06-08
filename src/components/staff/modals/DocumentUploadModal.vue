<template>
  <StaffModalShell :show="show" title="Upload Document" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Document Type</label>
        <input v-model="documentType" placeholder="e.g. License Renewal" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required />
        <p v-if="errors.documentType" class="mt-1 text-xs text-red-500">{{ errors.documentType }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">File</label>
        <input type="file" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" @change="onFile" />
        <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">Mock upload — filename stored only</p>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300" @click="$emit('close')">Cancel</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white">Upload</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'

defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const store = useStaffStore()
const documentType = ref('')
const fileName = ref('')
const errors = reactive({})

function onFile(e) { if (e.target.files.length) fileName.value = e.target.files[0].name }

function submit() {
  errors.documentType = ''
  if (!documentType.value) { errors.documentType = 'Document type required'; return }
  store.addDocument({ documentType: documentType.value, fileUrl: fileName.value || 'mock-upload.pdf' })
  store.showToast('Document uploaded', 'success')
  emit('close')
}
</script>
