<script setup>
import { ref, computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { resolveTranslatedValue } from '@/utils/locale'

const store = useStaffStore()
const { can } = useAuthPermissions()

const search = ref('')

const departments = computed(() => {
  let list = store.departments || []
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(d => resolveTranslatedValue(d.name).toLowerCase().includes(q))
  }
  return list
})

function staffCount(dept) {
  if (dept.staffCount !== undefined) return dept.staffCount
  if (dept.members !== undefined) return dept.members.length || dept.members
  const staff = store.facilityStaff || []
  return staff.filter(s => (s.departmentId || s.department) === dept.id).length
}
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Departments</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ departments.length }} department(s)</p>
      </div>
      <button v-if="can('departments.manage')" class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Department
      </button>
    </div>

    <div class="relative w-full sm:w-72">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">search</span>
      <input v-model="search" type="text" placeholder="Search departments..." class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="d in departments" :key="d.id" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-brand-primary text-[22px]">domain</span>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ resolveTranslatedValue(d.name) }}</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500">{{ d.head || d.hod || d.headName || '—' }}</p>
          </div>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{{ d.description || d.desc || '' }}</p>
        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ staffCount(d) }} staff</span>
          <button v-if="can('departments.manage')" class="text-xs font-bold text-brand-primary hover:underline">Manage</button>
        </div>
      </div>
      <div v-if="departments.length === 0" class="col-span-full text-center text-sm text-slate-400 dark:text-slate-500 py-10">No departments found.</div>
    </div>
  </div>
</template>
