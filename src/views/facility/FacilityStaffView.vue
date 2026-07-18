<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useI18n } from 'vue-i18n'
import { resolveTranslatedValue } from '@/utils/locale'
import { useFormatDate } from '@/composables/useFormatDate'
import { useDashboardStore } from '@/stores/dashboard'
import { getFacilityStaff, deleteFacilityStaff, createFacilityStaff } from '@/services/staffService'
import axiosClient from '@/axiosClient'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import BaseEmptyState from '@/components/dashboard/global/BaseEmptyState.vue'
import FacilityStaffPermissionsModal from '@/components/dashboard/Access/FacilityStaffPermissionsModal.vue'

const workspaceStore = useWorkspaceStore()
const dashboardStore = useDashboardStore()
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

// Add Staff Modal
const addModalOpen = ref(false)
const addSaving = ref(false)
const addForm = ref({
  email: '',
  name_en: '',
  name_ar: '',
  specialization_uuid: '',
  experience_years: null,
  avatar: null,
  cover_image: null,
  bio_en: '',
  bio_ar: '',
  consultation_fee: null,
  position_uuid: '',
  department_uuid: '',
  role_uuid: '',
})
const addAvatarPreview = ref('')
const roles = ref([])
const positions = ref([])
const departments = ref([])
const specializations = ref([])
const addCoverPreview = ref('')

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
  if (!member) return '—'
  return resolveTranslatedValue(member.user?.name || member.name, locale.value) || '—'
}

function getStaffEmail(member) {
  if (!member) return '—'
  return member.user?.email || member.email || '—'
}

function getStaffPhone(member) {
  if (!member) return '—'
  return member.user?.phone || member.phone || '—'
}

function getStaffRole(member) {
  if (!member) return null
  const facility = member.facilities?.[0]
  return facility?.role || member.role || null
}

function getStaffRoleSlug(member) {
  const role = getStaffRole(member)
  if (!role) return ''
  return role.slug || ''
}

function getStaffDepartment(member) {
  if (!member) return null
  const facility = member.facilities?.[0]
  return facility?.department?.name || member.department?.name || null
}

function getStaffUuid(member) {
  if (!member) return null
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

// Add Staff functions
async function loadFormData() {
  try {
    const [lookupRes, specRes] = await Promise.all([
      axiosClient.get(`/dashboard/facility/${workspaceStore.currentFacility?.uuid}/staff-lookup`),
      axiosClient.get('/dashboard/specializations/lookup'),
    ])
    const lookup = lookupRes.data.data || lookupRes.data
    roles.value = lookup.roles || []
    positions.value = lookup.positions || []
    departments.value = lookup.departments || []
    specializations.value = specRes.data.data || []
  } catch { /* ignore */ }
}

function openAddModal() {
  addForm.value = {
    email: '',
    name_en: '',
    name_ar: '',
    specialization_uuid: '',
    experience_years: null,
    avatar: null,
    cover_image: null,
    bio_en: '',
    bio_ar: '',
    consultation_fee: null,
    position_uuid: '',
    department_uuid: '',
    role_uuid: '',
  }
  addAvatarPreview.value = ''
  addCoverPreview.value = ''
  addModalOpen.value = true
  loadFormData()
}

function onAvatarChange(e) {
  const file = e.target.files[0]
  if (file) {
    addForm.value.avatar = file
    addAvatarPreview.value = URL.createObjectURL(file)
  }
}

function removeAvatar() {
  addForm.value.avatar = null
  addAvatarPreview.value = ''
}

function onCoverChange(e) {
  const file = e.target.files[0]
  if (file) {
    addForm.value.cover_image = file
    addCoverPreview.value = URL.createObjectURL(file)
  }
}

function removeCover() {
  addForm.value.cover_image = null
  addCoverPreview.value = ''
}

async function submitAddStaff() {
  addSaving.value = true
  try {
    const fd = new FormData()
    fd.append('email', addForm.value.email)
    fd.append('name[en]', addForm.value.name_en)
    fd.append('name[ar]', addForm.value.name_ar)
    if (addForm.value.specialization_uuid) fd.append('specialization_uuid', addForm.value.specialization_uuid)
    if (addForm.value.experience_years) fd.append('experience_years', addForm.value.experience_years)
    if (addForm.value.avatar) fd.append('avatar', addForm.value.avatar)
    if (addForm.value.cover_image) fd.append('cover_image', addForm.value.cover_image)
    if (addForm.value.bio_en) fd.append('bio[en]', addForm.value.bio_en)
    if (addForm.value.bio_ar) fd.append('bio[ar]', addForm.value.bio_ar)
    if (addForm.value.consultation_fee) fd.append('consultation_fee', addForm.value.consultation_fee)
    if (addForm.value.position_uuid) fd.append('position_uuid', addForm.value.position_uuid)
    if (addForm.value.department_uuid) fd.append('department_uuid', addForm.value.department_uuid)
    fd.append('role_uuid', addForm.value.role_uuid)

    await createFacilityStaff(fd)
    dashboardStore.addToast(t('staff.created') || 'Staff member added successfully', 'success')
    addModalOpen.value = false
    await fetchStaff()
  } catch (err) {
    dashboardStore.addToast(err.response?.data?.message || 'Failed to add staff member', 'error')
  } finally {
    addSaving.value = false
  }
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
      <button
        v-if="can('update_staff')"
        class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition cursor-pointer"
        @click="openAddModal"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        {{ t('staff.addStaff') || 'Add Staff' }}
      </button>
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
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition cursor-pointer"
                    title="Permissions"
                    @click="openPermissionsModal(member)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
                    title="Remove"
                    @click="openDeleteModal(member)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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

    <!-- Add Staff Modal -->
    <Teleport to="body">
      <div v-if="addModalOpen" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4" @click.self="addModalOpen = false">
        <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700">
          <div class="p-5 px-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('staff.addStaff') || 'Add Staff Member' }}</h3>
            <button class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition" @click="addModalOpen = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form @submit.prevent="submitAddStaff" class="flex flex-col flex-1 overflow-hidden">
            <div class="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
              <!-- Name -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Name (English) *</label>
                  <input type="text" v-model="addForm.name_en" required dir="ltr" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Name (Arabic) *</label>
                  <input type="text" v-model="addForm.name_ar" required dir="rtl" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition text-right" />
                </div>
              </div>

              <!-- Email -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Email *</label>
                <input type="email" v-model="addForm.email" required class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" />
              </div>

              <!-- Role -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Role *</label>
                <select v-model="addForm.role_uuid" required class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer">
                  <option value="">Select a role</option>
                  <option v-for="role in roles" :key="role.uuid || role.id" :value="role.uuid || role.id">{{ resolveTranslatedValue(role.name) }}</option>
                </select>
              </div>

              <!-- Specialization -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Specialization</label>
                <select v-model="addForm.specialization_uuid" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer">
                  <option value="">Select a specialization</option>
                  <option v-for="spec in specializations" :key="spec.uuid" :value="spec.uuid">{{ resolveTranslatedValue(spec.name) }}</option>
                </select>
              </div>

              <!-- Position & Department -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Position</label>
                  <select v-model="addForm.position_uuid" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer">
                    <option value="">Select a position</option>
                    <option v-for="pos in positions" :key="pos.uuid || pos.id" :value="pos.uuid || pos.id">{{ resolveTranslatedValue(pos.name) }}</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Department</label>
                  <select v-model="addForm.department_uuid" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer">
                    <option value="">Select a department</option>
                    <option v-for="dept in departments" :key="dept.uuid || dept.id" :value="dept.uuid || dept.id">{{ resolveTranslatedValue(dept.name) }}</option>
                  </select>
                </div>
              </div>

              <!-- Experience & Fee -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Experience (Years)</label>
                  <input type="number" v-model="addForm.experience_years" min="0" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Consultation Fee</label>
                  <input type="number" v-model="addForm.consultation_fee" min="0" step="0.01" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" />
                </div>
              </div>

              <!-- Bio -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Bio (English)</label>
                  <textarea v-model="addForm.bio_en" rows="2" dir="ltr" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition resize-none"></textarea>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Bio (Arabic)</label>
                  <textarea v-model="addForm.bio_ar" rows="2" dir="rtl" class="w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition resize-none text-right"></textarea>
                </div>
              </div>

              <!-- Avatar & Cover -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Avatar</label>
                  <div v-if="addAvatarPreview" class="relative group w-fit">
                    <img :src="addAvatarPreview" class="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700" />
                    <button type="button" @click="removeAvatar" class="absolute -top-1.5 -right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-lg">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <label v-else class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-brand-primary dark:hover:border-brand-primary transition bg-slate-50 dark:bg-slate-800/50">
                    <svg class="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/></svg>
                    <span class="text-xs text-slate-500 font-medium">Click to upload avatar</span>
                    <span class="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 2MB</span>
                    <input type="file" class="hidden" accept="image/*" @change="onAvatarChange" />
                  </label>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-600 dark:text-slate-400">Cover Image</label>
                  <div v-if="addCoverPreview" class="relative group w-full">
                    <img :src="addCoverPreview" class="w-full h-32 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700" />
                    <button type="button" @click="removeCover" class="absolute -top-1.5 -right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-lg">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <label v-else class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-brand-primary dark:hover:border-brand-primary transition bg-slate-50 dark:bg-slate-800/50">
                    <svg class="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v12A2.25 2.25 0 003.75 21z"/></svg>
                    <span class="text-xs text-slate-500 font-medium">Click to upload cover</span>
                    <span class="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
                    <input type="file" class="hidden" accept="image/*" @change="onCoverChange" />
                  </label>
                </div>
              </div>
            </div>

            <div class="p-4 px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button type="button" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="addModalOpen = false">
                {{ t('common.cancel') }}
              </button>
              <button type="submit" :disabled="addSaving" class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer">
                <svg v-if="addSaving" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                {{ t('staff.addStaff') || 'Add Staff' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
