<template>
  <StaffModalShell :show="show" title="Upload Document" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">Document Type</label>
        <input v-model="documentType" placeholder="e.g. License Renewal" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 px-3 py-2.5 text-sm" required />
        <p v-if="errors.documentType" class="mt-1 text-xs text-red-500">{{ errors.documentType }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('common.file') }}</label>
        <input type="file" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" @change="onFile" />
        <p class="mt-1 text-xs text-slate-400">Mock upload — filename stored only</p>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white">{{ $t('common.upload') }}</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import { useI18n } from 'vue-i18n'

defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { t } = useI18n()
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
