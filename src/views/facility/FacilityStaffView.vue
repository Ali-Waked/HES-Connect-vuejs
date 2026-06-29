<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'
import { useFormatDate } from '@/composables/useFormatDate'
import { getFacilityStaff, deleteFacilityStaff } from '@/services/staffService'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue'
import FacilityStaffPermissionsModal from '@/components/dashboard/Access/FacilityStaffPermissionsModal.vue'

const workspaceStore = useWorkspaceStore()
const { can } = useAuthPermissions()
const { t, locale } = useI18n()
const { formatDate } = useFormatDate()

const staff = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')
const filterRole = ref('')
const currentPage = ref(1)
const perPage = ref(15)
const pagination = ref({ current_page: 1, last_page: 1, total: 0, per_page: 15, from: 0, to: 0 })
const deleteModalOpen = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
const permissionsModalOpen = ref(false)
const permissionsTarget = ref(null)

let searchDebounce = null

function debouncedSearch(val) {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    search.value = val
    currentPage.value = 1
    fetchStaff()
  }, 350)
}

function setFilter(key, value) {
  if (key === 'role') filterRole.value = value
  currentPage.value = 1
  fetchStaff()
}

function setPage(page) {
  currentPage.value = page
  fetchStaff()
}

function resolveName(field) {
  if (!field) return '—'
  if (typeof field === 'string') return field
  return resolveTranslatedValue(field.name || field, locale.value) || '—'
}

function getAvatarUrl(member) {
  return member.user?.avatar || member.avatar || null
}

function getStaffName(member) {
  return resolveTranslatedValue(member.user?.name || member.name, locale.value) || '—'
}

function getStaffEmail(member) {
  return member.user?.email || member.email || '—'
}

function getStaffPhone(member) {
  return member.user?.phone || member.phone || '—'
}

function getStaffRole(member) {
  const facility = member.facilities?.[0]
  return facility?.role || member.role || null
}

function getStaffRoleSlug(member) {
  const role = getStaffRole(member)
  if (!role) return ''
  return role.slug || ''
}

function getStaffDepartment(member) {
  const facility = member.facilities?.[0]
  return facility?.department?.name || member.department?.name || null
}

function getStaffUuid(member) {
  const facility = member.facilities?.[0]
  return facility?.facility_staff_uuid || member.uuid || member.id
}

function shortUuid(uuid) {
  return uuid ? uuid.slice(0, 8) + '...' : '—'
}

function formatRole(role) {
  if (!role) return '—'
  if (typeof role === 'object') return resolveTranslatedValue(role.name || role, locale.value)
  return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

async function fetchStaff() {
  loading.value = true
  error.value = null
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
    }
    if (search.value) params.search = search.value
    if (filterRole.value) params.role = filterRole.value

    const { data } = await getFacilityStaff(params)
    staff.value = data.data || []
    if (data.meta) {
      pagination.value = {
        current_page: data.meta.current_page || 1,
        last_page: data.meta.last_page || 1,
        per_page: data.meta.per_page || 15,
        total: data.meta.total || 0,
        from: data.meta.from || 0,
        to: data.meta.to || 0,
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load staff'
    staff.value = []
  } finally {
    loading.value = false
  }
}

function openDeleteModal(member) {
  deleteTarget.value = member
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  deleteModalOpen.value = false
  deleteTarget.value = null
}

function openPermissionsModal(member) {
  permissionsTarget.value = member
  permissionsModalOpen.value = true
}

function closePermissionsModal() {
  permissionsModalOpen.value = false
  permissionsTarget.value = null
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteFacilityStaff(getStaffUuid(deleteTarget.value))
    deleteModalOpen.value = false
    deleteTarget.value = null
    await fetchStaff()
  } catch {
  } finally {
    deleting.value = false
  }
}

const visiblePages = computed(() => {
  const total = pagination.value.last_page
  const cur = pagination.value.current_page
  const pages = []
  let start = Math.max(1, cur - 2)
  let end = Math.min(total, cur + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

onMounted(() => {
  fetchStaff()
})

watch(() => workspaceStore.currentWorkspaceId, () => {
  currentPage.value = 1
  search.value = ''
  filterRole.value = ''
  fetchStaff()
})
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Staff</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ pagination.total }} staff member(s)</p>
      </div>
    </div>

    <div v-if="error" class="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
        <span class="material-symbols-outlined text-lg">error</span>
        <span>{{ error }}</span>
      </div>
      <button class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 underline transition cursor-pointer" @click="fetchStaff">Retry</button>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div class="relative w-full sm:w-72">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">search</span>
        <input
          type="text"
          placeholder="Search staff..."
          class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          @input="debouncedSearch($event.target.value)"
        />
      </div>
      <select
        :value="filterRole"
        class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 min-w-[140px]"
        @change="setFilter('role', $event.target.value)"
      >
        <option value="">All Roles</option>
        <option value="doctor">Doctor</option>
        <option value="nurse">Nurse</option>
        <option value="pharmacist">Pharmacist</option>
        <option value="receptionist">Receptionist</option>
      </select>
    </div>

    <div v-if="loading" class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th class="px-5 py-3.5">Name</th>
            <th class="px-5 py-3.5">Role</th>
            <th class="px-5 py-3.5">Department</th>
            <th class="px-5 py-3.5">Email</th>
            <th class="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <tr v-for="i in 5" :key="i" class="animate-pulse">
            <td class="px-5 py-3.5"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700"></div><div class="space-y-1.5"><div class="h-4 w-28 bg-slate-100 dark:bg-slate-700 rounded"></div><div class="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div></div></div></td>
            <td class="px-5 py-3.5"><div class="h-5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div></td>
            <td class="px-5 py-3.5"><div class="h-4 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
            <td class="px-5 py-3.5"><div class="h-4 w-32 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
            <td class="px-5 py-3.5"><div class="h-7 w-16 bg-slate-100 dark:bg-slate-700 rounded-lg ml-auto"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th class="px-5 py-3.5">Name</th>
            <th class="px-5 py-3.5">Role</th>
            <th class="px-5 py-3.5">Department</th>
            <th class="px-5 py-3.5">Email</th>
            <th v-if="can('update_staff')" class="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
          <template v-if="staff.length">
            <tr v-for="member in staff" :key="member.uuid" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div v-if="getAvatarUrl(member)" class="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-100 dark:ring-slate-700">
                    <img :src="getAvatarUrl(member)" :alt="getStaffName(member)" class="w-full h-full object-cover" />
                  </div>
                  <AvatarInitial v-else :name="getStaffName(member)" />
                  <div>
                    <p class="font-semibold text-slate-900 dark:text-white text-sm">{{ getStaffName(member) }}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500">{{ getStaffEmail(member) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                  :class="{
                    'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400': getStaffRoleSlug(member) === 'doctor',
                    'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400': getStaffRoleSlug(member) === 'nurse',
                    'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400': getStaffRoleSlug(member) === 'pharmacist',
                    'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400': getStaffRoleSlug(member) === 'receptionist',
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400': !['doctor','nurse','pharmacist','receptionist'].includes(getStaffRoleSlug(member)),
                  }"
                >
                  {{ formatRole(getStaffRole(member)) }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400">{{ resolveTranslatedValue(getStaffDepartment(member), locale.value) || '—' }}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-slate-700 dark:text-slate-300">{{ getStaffPhone(member) }}</span>
                </div>
              </td>
              <td v-if="can('update_staff')" class="px-5 py-3.5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    @click="openPermissionsModal(member)"
                  >
                    <span class="material-symbols-outlined text-[14px]">settings</span>
                    Permissions
                  </button>
                  <button
                    class="inline-flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition cursor-pointer"
                    @click="openDeleteModal(member)"
                  >
                    <span class="material-symbols-outlined text-[14px]">delete</span>
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          </template>
          <tr v-else>
            <td :colspan="can('update_staff') ? 5 : 4" class="px-5 py-12">
              <BaseEmptyState
                v-if="search || filterRole"
                icon="group"
                title="No staff found"
                description="Try adjusting your search or filters."
              />
              <BaseEmptyState
                v-else
                icon="group"
                title="No staff members yet"
                description="Staff members will appear here once they are added to the facility."
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination.last_page > 1 && !loading" class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Showing <span class="font-bold text-slate-900 dark:text-white">{{ pagination.from || 0 }}</span>
        to <span class="font-bold text-slate-900 dark:text-white">{{ pagination.to || 0 }}</span>
        of <span class="font-bold text-slate-900 dark:text-white">{{ pagination.total }}</span> results
      </p>
      <div class="flex items-center gap-1.5">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          :disabled="pagination.current_page <= 1"
          @click="setPage(pagination.current_page - 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <button
          v-for="pg in visiblePages"
          :key="pg"
          class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-bold transition"
          :class="pg === pagination.current_page
            ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/15'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'"
          @click="setPage(pg)"
        >{{ pg }}</button>
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          :disabled="pagination.current_page >= pagination.last_page"
          @click="setPage(pagination.current_page + 1)"
        >
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="deleteModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Remove Staff Member</h3>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              @click="closeDeleteModal"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Are you sure you want to remove
            <strong class="text-slate-900 dark:text-white">{{ getStaffName(deleteTarget) }}</strong>
            from the facility? This action cannot be undone.
          </p>
          <div class="flex items-center justify-end gap-3">
            <button
              class="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              @click="closeDeleteModal"
            >Cancel</button>
            <button
              class="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              :disabled="deleting"
              @click="confirmDelete"
            >
              <span v-if="deleting" class="inline-flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Removing...
              </span>
              <span v-else>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <FacilityStaffPermissionsModal
      :show="permissionsModalOpen"
      :staff-member="permissionsTarget"
      :staff-uuid="getStaffUuid(permissionsTarget)"
      @close="closePermissionsModal"
    />
  </div>
</template>
