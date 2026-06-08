<template>
  <StaffModalShell :show="show" :title="isEdit ? 'Edit Job Post' : 'Add Job Post'" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Title</label>
        <input v-model="title" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required />
        <p v-if="errors.title" class="mt-1 text-xs text-red-500">{{ errors.title }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
        <textarea v-model="description" rows="3" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm"></textarea>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">Apply Method</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 text-sm"><input type="radio" v-model="applyMethod" value="email" /> Email</label>
          <label class="flex items-center gap-2 text-sm"><input type="radio" v-model="applyMethod" value="link" /> Link</label>
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ applyMethod === 'email' ? 'Email Address' : 'Apply URL' }}</label>
        <input v-model="applyValue" :type="applyMethod === 'email' ? 'email' : 'url'" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required />
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">End Date</label>
        <input type="date" v-model="endDate" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required />
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300" @click="$emit('close')">Cancel</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white">{{ isEdit ? 'Save' : 'Post' }}</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'

const props = defineProps({ show: Boolean, postId: Number })
const emit = defineEmits(['close'])
const store = useStaffStore()
const isEdit = computed(() => !!props.postId)
const title = ref('')
const description = ref('')
const applyMethod = ref('email')
const applyValue = ref('')
const endDate = ref('')
const errors = reactive({})

watch(() => props.show, (v) => {
  if (v && isEdit.value) {
    const p = store.jobPosts.find(j => j.id === props.postId)
    if (p) { title.value = p.title; description.value = p.description; applyMethod.value = p.applyMethod; applyValue.value = p.applyValue; endDate.value = p.endDate }
  } else if (v) { title.value = ''; description.value = ''; applyMethod.value = 'email'; applyValue.value = ''; endDate.value = '' }
})

function submit() {
  errors.title = ''
  if (!title.value) { errors.title = 'Title is required'; return }
  const data = { title: title.value, description: description.value, applyMethod: applyMethod.value, applyValue: applyValue.value, endDate: endDate.value }
  if (isEdit.value) { store.updateJobPost(props.postId, data); store.showToast('Job post updated', 'success') }
  else { store.addJobPost(data); store.showToast('Job post created', 'success') }
  emit('close')
}
</script>
