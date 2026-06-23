<script setup>
import { ref, computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { resolveTranslatedValue } from '@/utils/locale'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'

const store = useStaffStore()
const { can } = useAuthPermissions()

const search = ref('')
const filterDept = ref('all')
const currentPage = ref(1)
const perPage = 10

const departments = computed(() => {
  const depts = store.departments || []
  return [{ id: 'all', name: 'All Departments' }, ...depts]
})

const staff = computed(() => {
  let list = store.facilityStaff || []
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(s =>
      resolveTranslatedValue(s.name).toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.position || s.role || '').toLowerCase().includes(q)
    )
  }
  if (filterDept.value !== 'all') {
    list = list.filter(s => (s.departmentId || s.department) === filterDept.value)
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(staff.value.length / perPage)))
const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return staff.value.slice(start, start + perPage)
})

function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Staff</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ staff.length }} staff member(s)</p>
      </div>
      <button v-if="can('staff.manage')" class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Staff
      </button>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div class="relative w-full sm:w-72">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">search</span>
        <input v-model="search" type="text" placeholder="Search staff..." class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40" />
      </div>
      <select v-model="filterDept" class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40">
        <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th class="px-5 py-3.5">Name</th>
            <th class="px-5 py-3.5">Role</th>
            <th class="px-5 py-3.5">Department</th>
            <th class="px-5 py-3.5">Contact</th>
            <th class="px-5 py-3.5 text-right" v-if="can('staff.manage')">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <tr v-for="s in paginated" :key="s.id || s.email" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <AvatarInitial :name="resolveTranslatedValue(s.name)" />
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white text-sm">{{ resolveTranslatedValue(s.name) }}</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500">{{ s.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400 capitalize">{{ s.position || s.role || '—' }}</td>
            <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400">{{ s.departmentName || s.department || '—' }}</td>
            <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400">{{ s.phone || '—' }}</td>
            <td v-if="can('staff.manage')" class="px-5 py-3.5 text-right">
              <button class="rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition mr-1">Edit</button>
              <button class="rounded-lg bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition">Remove</button>
            </td>
          </tr>
          <tr v-if="paginated.length === 0">
            <td :colspan="can('staff.manage') ? 5 : 4" class="px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-500">No staff found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <p class="text-sm text-slate-500 dark:text-slate-400">Page {{ currentPage }} of {{ totalPages }}</p>
      <div class="flex gap-2">
        <button class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition" :disabled="currentPage === 1" @click="prevPage">Previous</button>
        <button class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
      </div>
    </div>
  </div>
</template>
