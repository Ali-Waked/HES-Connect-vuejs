<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { useI18n } from 'vue-i18n'
import { useFacilitySchedules } from '@/composables/useFacilitySchedules'
import { resolveTranslatedValue } from '@/utils/locale'
import SectionHeader from '@/components/dashboard/global/SectionHeader.vue'
import BaseTable from '@/components/dashboard/global/BaseTable.vue'
import BasePagination from '@/components/dashboard/global/BasePagination.vue'
import StatusBadge from '@/components/facility/schedules/StatusBadge.vue'
import ScheduleToolbar from '@/components/facility/schedules/ScheduleToolbar.vue'
import ScheduleEmptyState from '@/components/facility/schedules/ScheduleEmptyState.vue'
import ScheduleLoadingSkeleton from '@/components/facility/schedules/ScheduleLoadingSkeleton.vue'
import StaffScheduleCard from '@/components/facility/schedules/StaffScheduleCard.vue'
import ScheduleModal from '@/components/facility/schedules/ScheduleModal.vue'
import DeleteScheduleConfirm from '@/components/facility/schedules/DeleteScheduleConfirm.vue'

const workspaceStore = useWorkspaceStore()
const { can } = useAuthPermissions()
const { t, locale } = useI18n()
const {
  loading, error, saving, schedules, pagination, staffList,
  fetchSchedules, fetchStaffLookup, createSchedule, updateSchedule, deleteSchedule,
} = useFacilitySchedules()

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const viewMode = ref('card')

const showFormModal = ref(false)
const showDeleteModal = ref(false)
const selectedSchedule = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)

const dayMap = {
  0: { abbr: 'sun', label: 'Sunday' },
  1: { abbr: 'mon', label: 'Monday' },
  2: { abbr: 'tue', label: 'Tuesday' },
  3: { abbr: 'wed', label: 'Wednesday' },
  4: { abbr: 'thu', label: 'Thursday' },
  5: { abbr: 'fri', label: 'Friday' },
  6: { abbr: 'sat', label: 'Saturday' },
}

function formatTime(time) {
  return time?.length > 5 ? time.slice(0, 5) : time
}

const groupedSchedules = computed(() => {
  const groups = {}
  for (const s of schedules.value) {
    const staffKey = s.facility_staff?.uuid || s.facility_staff?.staff?.uuid
    if (!staffKey) continue
    if (!groups[staffKey]) {
      groups[staffKey] = { id: staffKey, schedules: {}, _rawSchedules: [] }
    }
    groups[staffKey].schedules[s.day_of_week] = s
    groups[staffKey]._rawSchedules.push(s)
  }
  return Object.values(groups)
})

let searchTimeout = null

function debouncedFetch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchList()
  }, 400)
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  fetchList()
}

function setPage(page) {
  currentPage.value = page
  fetchList()
}

function fetchList() {
  fetchSchedules({
    page: currentPage.value,
    per_page: perPage.value,
    ...(searchQuery.value ? { search: searchQuery.value } : {}),
    ...(statusFilter.value ? { is_active: statusFilter.value === 'active' ? 1 : 0 } : {}),
  })
}

function getScheduleId(s) {
  return s.uuid || s.id
}

function getStaffName(s) {
  const name = s.facility_staff?.staff?.full_name || s.facility_staff?.staff?.name
  return resolveTranslatedValue(name) || `Staff #${s.facility_staff?.staff?.uuid || s.id || ''}`
}

function getSpecialization(s) {
  const spec = s.facility_staff?.staff?.specialization
  return spec ? resolveTranslatedValue(spec, locale.value) : '—'
}

function getDayAbbr(num) {
  return dayMap[num]?.abbr || ''
}

function getDayLabel(num) {
  const info = dayMap[num]
  if (!info) return `Day ${num}`
  return info.label
}

const dayBadgeClass = {
  sun: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  mon: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  tue: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  wed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  thu: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  fri: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  sat: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

function getDayColor(num) {
  const abbr = getDayAbbr(num)
  return dayBadgeClass[abbr] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

function openAddModal() {
  selectedSchedule.value = null
  showFormModal.value = true
}

function openEditModal(staffGroup) {
  const raw = staffGroup._rawSchedules[0]
  const days = [...new Set(staffGroup._rawSchedules.map(s => s.day_of_week).filter(n => n !== undefined && n !== null))]
  selectedSchedule.value = {
    ...raw,
    days_of_week: days,
    staff_uuid: raw.facility_staff?.staff?.uuid || raw.facility_staff?.uuid,
  }
  showFormModal.value = true
}

function openDeleteModal(staffGroup) {
  const raw = staffGroup._rawSchedules[0]
  deleteTarget.value = { ...raw, uuid: getScheduleId(raw) }
  showDeleteModal.value = true
}

function openEditTableModal(schedule) {
  const ft = schedule.facility_staff?.staff
  selectedSchedule.value = {
    ...schedule,
    days_of_week: schedule.day_of_week !== undefined && schedule.day_of_week !== null ? [schedule.day_of_week] : [],
    staff_uuid: ft?.uuid || schedule.facility_staff?.uuid,
  }
  showFormModal.value = true
}

function openDeleteTableModal(schedule) {
  deleteTarget.value = { ...schedule, uuid: getScheduleId(schedule) }
  showDeleteModal.value = true
}

async function handleSubmit(formData) {
  const id = selectedSchedule.value?.id
  const result = id
    ? await updateSchedule(id, formData)
    : await createSchedule(formData)
  if (result.success) {
    showFormModal.value = false
    selectedSchedule.value = null
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  const result = await deleteSchedule(deleteTarget.value.uuid)
  deleting.value = false
  if (result.success) {
    showDeleteModal.value = false
    deleteTarget.value = null
  }
}

const tableColumns = computed(() => [
  { key: 'staff', label: 'Staff', sortable: true },
  { key: 'day_of_week', label: 'Day' },
  { key: 'hours', label: 'Hours', sortable: true },
  { key: 'slot_duration', label: 'Slot' },
  { key: 'experience', label: 'Experience' },
  { key: 'fee', label: 'Fee' },
  { key: 'status', label: 'Status' },
  ...(can('update_staff_schedules') ? [{ key: 'actions', label: '', align: 'right', class: 'w-24' }] : []),
])

const tableItems = computed(() =>
  schedules.value.map(s => ({
    _raw: s,
    id: getScheduleId(s),
    staff: s,
    day_of_week: s.day_of_week,
    hours: s,
    slot_duration: s.slot_duration,
    experience: s.facility_staff?.staff?.years_of_experience,
    fee: s.facility_staff?.staff?.consultation_fee,
    status: s.is_active,
    actions: s,
  }))
)

onMounted(() => {
  fetchList()
  fetchStaffLookup()
})

watch(() => workspaceStore.currentWorkspaceId, () => {
  currentPage.value = 1
  searchQuery.value = ''
  statusFilter.value = ''
  fetchList()
})

watch(searchQuery, () => { debouncedFetch() })
watch(statusFilter, () => { debouncedFetch() })
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <SectionHeader
      :title="t('schedules.management') || 'Manage Staff Schedules'"
      :subtitle="t('schedules.subtitle') || 'Create, edit and organize your staff working schedules.'"
    >
      <template #actions>
        <div class="flex items-center gap-2">
        <!-- View Toggle -->
        <div class="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-sm">
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer"
            :class="viewMode === 'card' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
            @click="viewMode = 'card'"
          >
            <svg class="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
            Cards
          </button>
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer"
            :class="viewMode === 'table' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
            @click="viewMode = 'table'"
          >
            <svg class="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"/></svg>
            Table
          </button>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition cursor-pointer"
          @click="openAddModal"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {{ t('schedules.addSchedule') || 'Add Schedule' }}
        </button>
      </div>
      </template>
    </SectionHeader>

    <!-- Error -->
    <div v-if="error" class="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
        <span>{{ error }}</span>
      </div>
      <button class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 underline transition cursor-pointer" @click="fetchList">Retry</button>
    </div>

    <!-- Toolbar -->
    <ScheduleToolbar
      v-model:searchQuery="searchQuery"
      v-model:statusFilter="statusFilter"
      @clear="clearFilters"
    >
      <template #actions>
        <button
          class="sm:hidden inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition cursor-pointer"
          @click="openAddModal"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add
        </button>
      </template>
    </ScheduleToolbar>

    <!-- Loading -->
    <ScheduleLoadingSkeleton v-if="loading && !schedules.length" :count="6" />

    <!-- Empty -->
    <ScheduleEmptyState v-else-if="!schedules.length && !loading" :filter-active="!!(searchQuery || statusFilter)">
      <button
        v-if="!searchQuery && !statusFilter"
        class="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition cursor-pointer"
        @click="openAddModal"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Create Schedule
      </button>
    </ScheduleEmptyState>

    <!-- Content -->
    <template v-else>
      <!-- Card View -->
      <div v-if="viewMode === 'card'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <StaffScheduleCard
          v-for="group in groupedSchedules"
          :key="group.id"
          :staff-group="group"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'">
        <div class="hidden md:block">
          <BaseTable :columns="tableColumns" :items="tableItems" :loading="loading">
            <template #cell(staff)="{ item }">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-sm font-bold text-brand-primary shrink-0">
                  {{ getStaffName(item._raw).charAt(0) }}
                </div>
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white text-sm">{{ getStaffName(item._raw) }}</p>
                  <p class="text-[11px] text-slate-400 dark:text-slate-500">{{ getSpecialization(item._raw) }}</p>
                </div>
              </div>
            </template>
            <template #cell(day_of_week)="{ item }">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold" :class="getDayColor(item.day_of_week)">
                {{ getDayLabel(item.day_of_week) }}
              </span>
            </template>
            <template #cell(hours)="{ item }">
              <div class="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                <svg class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ formatTime(item._raw.start_time) }} - {{ formatTime(item._raw.end_time) }}
              </div>
            </template>
            <template #cell(slot_duration)="{ item }">
              <span class="text-sm text-slate-600 dark:text-slate-400">{{ item.slot_duration }} min</span>
            </template>
            <template #cell(experience)="{ item }">
              <span class="text-sm text-slate-600 dark:text-slate-400">{{ item.experience ?? '—' }} yrs</span>
            </template>
            <template #cell(fee)="{ item }">
              <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ item.fee ? `$${item.fee}` : '—' }}</span>
            </template>
            <template #cell(status)="{ item }">
              <StatusBadge :active="item.status" />
            </template>
            <template #cell(actions)="{ item }">
              <div class="flex items-center justify-end gap-1">
                <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition cursor-pointer" title="Edit" @click="openEditTableModal(item._raw)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer" title="Delete" @click="openDeleteTableModal(item._raw)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </template>
            <template #empty>
              <ScheduleEmptyState :filter-active="true" />
            </template>
          </BaseTable>
        </div>

        <!-- Mobile Table Cards (same as before) -->
        <div class="md:hidden space-y-3">
          <div v-for="schedule in schedules" :key="getScheduleId(schedule)" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-sm font-bold text-brand-primary shrink-0">
                  {{ getStaffName(schedule).charAt(0) }}
                </div>
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white text-sm">{{ getStaffName(schedule) }}</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500">{{ getSpecialization(schedule) }}</p>
                </div>
              </div>
              <div v-if="can('update_staff_schedules')" class="flex gap-1">
                <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer" @click="openEditTableModal(schedule)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer" @click="openDeleteTableModal(schedule)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold" :class="getDayColor(schedule.day_of_week)">
                {{ getDayLabel(schedule.day_of_week) }}
              </span>
              <StatusBadge :active="schedule.is_active" />
            </div>
            <div class="grid grid-cols-2 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}
              </div>
              <div>{{ schedule.slot_duration }} min</div>
              <div>Exp: {{ schedule.facility_staff?.staff?.years_of_experience ?? '—' }} yrs</div>
              <div>Fee: <span class="font-semibold text-slate-900 dark:text-white">{{ schedule.facility_staff?.staff?.consultation_fee ? `$${schedule.facility_staff.staff.consultation_fee}` : '—' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <BasePagination
          v-if="pagination.last_page > 1"
          :current-page="pagination.current_page"
          :total-pages="pagination.last_page"
          :total-items="pagination.total"
          :items-per-page="pagination.per_page"
          @change="setPage"
        />
      </div>
    </template>

    <!-- Create/Edit Modal -->
    <ScheduleModal
      :show="showFormModal"
      :schedule="selectedSchedule"
      :staff-list="staffList"
      :saving="saving"
      @close="showFormModal = false; selectedSchedule = null"
      @submit="handleSubmit"
    />

    <!-- Delete Confirmation -->
    <DeleteScheduleConfirm
      :show="showDeleteModal"
      :schedule="deleteTarget"
      :deleting="deleting"
      @confirm="confirmDelete"
      @close="showDeleteModal = false; deleteTarget = null"
    />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
