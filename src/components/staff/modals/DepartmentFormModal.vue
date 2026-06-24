<template>
  <StaffModalShell :show="show" :title="isEdit ? $t('common.edit') + ' ' + $t('departments.title') : $t('departments.addDepartment')" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('departments.name_en') }}</label>
          <input v-model="name_en" dir="ltr" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required />
          <p v-if="errors.name_en" class="mt-1 text-xs text-red-500">{{ errors.name_en }}</p>
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700 text-right">{{ $t('departments.name_ar') }}</label>
          <input v-model="name_ar" dir="rtl" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm text-right" required />
          <p v-if="errors.name_ar" class="mt-1 text-xs text-red-500 text-right">{{ errors.name_ar }}</p>
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('departments.head') }}</label>
        <select v-model="headDoctor" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required>
          <option value="" disabled>Select head doctor</option>
          <option v-for="s in doctorStaff" :key="s.id" :value="s.name_en">{{ localField(s, 'name') }}</option>
        </select>
      </div>
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 cursor-pointer" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white cursor-pointer">{{ isEdit ? $t('common.save') : $t('common.add') }}</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '@/composables/useLocaleField'

const props = defineProps({ show: Boolean, departmentId: Number })
const emit = defineEmits(['close'])
const { t } = useI18n()
const { localField } = useLocaleField()
const store = useStaffStore()
const isEdit = computed(() => !!props.departmentId)
const name_en = ref('')
const name_ar = ref('')
const headDoctor = ref('')
const error = ref('')
const errors = reactive({})
const doctorStaff = computed(() => store.facilityStaff.filter(s => s.role?.slug === 'doctor'))

watch(() => props.show, (v) => {
  if (v && isEdit.value) {
    const d = store.departments.find(dept => dept.id === props.departmentId)
    if (d) { 
      name_en.value = d.name_en || d.name || ''
      name_ar.value = d.name_ar || ''
      headDoctor.value = d.headDoctor 
    }
  } else if (v) { 
    name_en.value = ''
    name_ar.value = ''
    headDoctor.value = '' 
  }
})

function submit() {
  errors.name_en = ''
  errors.name_ar = ''
  if (!name_en.value) { errors.name_en = 'English name is required'; return }
  if (!name_ar.value) { errors.name_ar = 'Arabic name is required'; return }
  
  const data = { 
    name_en: name_en.value, 
    name_ar: name_ar.value, 
    headDoctor: headDoctor.value 
  }

  if (isEdit.value) { 
    store.updateDepartment(props.departmentId, data)
    store.showToast('Department updated', 'success') 
  } else { 
    store.addDepartment(data)
    store.showToast('Department added', 'success') 
  }
  emit('close')
}
</script>
