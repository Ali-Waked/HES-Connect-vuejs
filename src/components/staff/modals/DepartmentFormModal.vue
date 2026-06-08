<template>
  <StaffModalShell :show="show" :title="isEdit ? 'Edit Department' : 'Add Department'" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Department Name</label>
        <input v-model="name" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required />
        <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Head Doctor</label>
        <select v-model="headDoctor" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required>
          <option value="" disabled>Select head doctor</option>
          <option v-for="s in doctorStaff" :key="s.id" :value="s.name">{{ s.name }}</option>
        </select>
      </div>
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300" @click="$emit('close')">Cancel</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white">{{ isEdit ? 'Save' : 'Add' }}</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'

const props = defineProps({ show: Boolean, departmentId: Number })
const emit = defineEmits(['close'])
const store = useStaffStore()
const isEdit = computed(() => !!props.departmentId)
const name = ref('')
const headDoctor = ref('')
const error = ref('')
const errors = reactive({})
const doctorStaff = computed(() => store.facilityStaff.filter(s => s.specialization !== 'Nursing' && s.specialization !== 'Pharmacy'))

watch(() => props.show, (v) => {
  if (v && isEdit.value) {
    const d = store.departments.find(dept => dept.id === props.departmentId)
    if (d) { name.value = d.name; headDoctor.value = d.headDoctor }
  } else if (v) { name.value = ''; headDoctor.value = '' }
})

function submit() {
  errors.name = ''
  if (!name.value) { errors.name = 'Name is required'; return }
  if (isEdit.value) { store.updateDepartment(props.departmentId, { name: name.value, headDoctor: headDoctor.value }); store.showToast('Department updated', 'success') }
  else { store.addDepartment({ name: name.value, headDoctor: headDoctor.value }); store.showToast('Department added', 'success') }
  emit('close')
}
</script>
