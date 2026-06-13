<template>
  <StaffModalShell :show="show" :title="isEdit ? $t('jobs.editJob') : $t('jobs.postJob')" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('jobs.title_en') }}</label>
          <input v-model="title_en" dir="ltr" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required />
          <p v-if="errors.title_en" class="mt-1 text-xs text-red-500">{{ errors.title_en }}</p>
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700 text-right">{{ $t('jobs.title_ar') }}</label>
          <input v-model="title_ar" dir="rtl" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm text-right" required />
          <p v-if="errors.title_ar" class="mt-1 text-xs text-red-500 text-right">{{ errors.title_ar }}</p>
        </div>
      </div>
      
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('jobs.description_en') }}</label>
        <textarea v-model="description_en" dir="ltr" rows="2" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm"></textarea>
      </div>

      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 text-right">{{ $t('jobs.description_ar') }}</label>
        <textarea v-model="description_ar" dir="rtl" rows="2" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm text-right"></textarea>
      </div>

      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('jobs.applyMethod') }}</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 text-sm"><input type="radio" v-model="applyMethod" value="email" /> Email</label>
          <label class="flex items-center gap-2 text-sm"><input type="radio" v-model="applyMethod" value="link" /> Link</label>
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ applyMethod === 'email' ? 'Email Address' : 'Apply URL' }}</label>
        <input v-model="applyValue" :type="applyMethod === 'email' ? 'email' : 'url'" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required />
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('jobs.endDate') }}</label>
        <input type="date" v-model="endDate" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required />
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 cursor-pointer" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white cursor-pointer">{{ isEdit ? $t('common.save') : $t('common.add') }}</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ show: Boolean, postId: Number })
const emit = defineEmits(['close'])
const { t } = useI18n()
const store = useStaffStore()
const isEdit = computed(() => !!props.postId)
const title_en = ref('')
const title_ar = ref('')
const description_en = ref('')
const description_ar = ref('')
const applyMethod = ref('email')
const applyValue = ref('')
const endDate = ref('')
const errors = reactive({})

watch(() => props.show, (v) => {
  if (v && isEdit.value) {
    const p = store.jobPosts.find(j => j.id === props.postId)
    if (p) { 
      title_en.value = p.title_en || p.title || ''
      title_ar.value = p.title_ar || ''
      description_en.value = p.description_en || p.description || ''
      description_ar.value = p.description_ar || ''
      applyMethod.value = p.applyMethod
      applyValue.value = p.applyValue
      endDate.value = p.endDate 
    }
  } else if (v) { 
    title_en.value = ''
    title_ar.value = ''
    description_en.value = ''
    description_ar.value = ''
    applyMethod.value = 'email'
    applyValue.value = ''
    endDate.value = '' 
  }
})

function submit() {
  errors.title_en = ''
  errors.title_ar = ''
  if (!title_en.value) { errors.title_en = 'English title is required'; return }
  if (!title_ar.value) { errors.title_ar = 'Arabic title is required'; return }

  const data = { 
    title_en: title_en.value, 
    title_ar: title_ar.value, 
    description_en: description_en.value, 
    description_ar: description_ar.value, 
    applyMethod: applyMethod.value, 
    applyValue: applyValue.value, 
    endDate: endDate.value 
  }

  if (isEdit.value) { 
    store.updateJobPost(props.postId, data)
    store.showToast('Job post updated', 'success') 
  } else { 
    store.addJobPost(data)
    store.showToast('Job post created', 'success') 
  }
  emit('close')
}
</script>
