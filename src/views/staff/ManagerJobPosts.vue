<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ $t('jobs.management') }}</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ pagination.total || 0 }} {{ $t('jobs.openings') }} {{ $t('jobs.listed') }}</p>
      </div>
      <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white hover:bg-brand-primary-hover transition cursor-pointer" @click="openAdd">+ {{ $t('jobs.postJob') }}</button>
    </div>

    <!-- Stats Cards -->
    <div v-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504 1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504 1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" /></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.total') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.total }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.pending') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.pending }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.approved') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.approved }}</p>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ $t('jobs.expiringSoon') }}</p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.expiring || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="relative max-w-md">
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" v-model="searchQuery" class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition" :placeholder="$t('jobs.searchPlaceholder')"/>
    </div>

    <!-- Table -->
    <DataTable :columns="columns" :items="jobPosts" :loading="loading" :empty-title="$t('jobs.noResults')">
      <template #cell-title="{ item }">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504 1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504 1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" /></svg>
          </div>
          <div class="min-w-0">
            <span class="text-sm font-semibold text-slate-900 dark:text-white truncate block">{{ localField(item, 'title') }}</span>
            <span class="text-xs text-slate-500">{{ localField(item, 'description') ? localField(item, 'description').slice(0, 60) + '...' : '' }}</span>
          </div>
        </div>
      </template>
      <template #cell-applyMethod="{ item }">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]" :class="item.apply_method === 'email' ? 'text-blue-600' : 'text-slate-600'">{{ item.apply_method === 'email' ? 'mail' : 'link' }}</span>
          <span class="text-sm capitalize">{{ item.apply_method || '—' }}</span>
        </div>
      </template>
      <template #cell-endDate="{ item }">
        <span :class="isNearEnd(item.end_date) ? 'text-red-600 font-bold' : 'text-slate-700 dark:text-slate-300'" class="text-sm">{{ formatDate(item.end_date) }}</span>
      </template>
      <template #cell-status="{ item }">
        <StatusBadge :status="item.status" />
      </template>
      <template #cell-actions="{ item }">
        <div class="flex gap-2">
          <button class="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer" @click="openEdit(item)">{{ $t('common.edit') }}</button>
          <button class="rounded-md border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer" @click="confirmDelete(item)">{{ $t('common.delete') }}</button>
        </div>
      </template>
    </DataTable>

    <div v-if="pagination.total > 0" class="flex items-center justify-between">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        {{ $t('common.showing') }} {{ pagination.from || 0 }}–{{ pagination.to || 0 }} {{ $t('common.of') }} {{ pagination.total }}
      </p>
      <div class="flex gap-2">
        <button :disabled="!pagination.prev_page_url" class="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer" @click="page--">{{ $t('common.prev') }}</button>
        <button :disabled="!pagination.next_page_url" class="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer" @click="page++">{{ $t('common.next') }}</button>
      </div>
    </div>

    <JobPostFormModal :show="formModal" :post="selectedPost" @close="formModal = false; selectedPost = null" />
    <ConfirmModal v-model:modelValue="confirm.visible" :title="$t('jobs.deleteJob')" :message="confirm.message" :confirmText="$t('common.delete')" :cancelText="$t('common.cancel')" @confirm="onDelete" @cancel="confirm.visible = false" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleField } from '@/composables/useLocaleField'
import { useFormatDate } from '@/composables/useFormatDate'
import { useFacilityJobs } from '@/composables/useFacilityJobs'
import DataTable from '@/components/staff/shared/DataTable.vue'
import StatusBadge from '@/components/staff/shared/StatusBadge.vue'
import JobPostFormModal from '@/components/staff/modals/JobPostFormModal.vue'
import ConfirmModal from '@/components/staff/modals/ConfirmModal.vue'

const { t } = useI18n()
const { localField } = useLocaleField()
const { formatDate } = useFormatDate()
const { jobPosts, loading, pagination, stats, statsLoading, fetchJobPosts, fetchJobPostStats, deleteJobPost } = useFacilityJobs()

const searchQuery = ref('')
const page = ref(1)
const formModal = ref(false)
const selectedPost = ref(null)

const columns = [
  { key: 'title', label: t('jobs.jobTitle') },
  { key: 'applyMethod', label: t('jobs.applyMethod') },
  { key: 'endDate', label: t('jobs.endDate') },
  { key: 'status', label: t('jobs.status') },
  { key: 'actions', label: t('common.actions') }
]

const confirm = ref({ visible: false, item: null, message: '' })

function isNearEnd(date) {
  const diff = (new Date(date) - new Date()) / 86400000
  return diff < 7 && diff >= 0
}

function openAdd() { selectedPost.value = null; formModal.value = true }
function openEdit(post) { selectedPost.value = post; formModal.value = true }

function confirmDelete(item) {
  confirm.value.item = item
  confirm.value.message = t('jobs.deleteConfirm', { title: localField(item, 'title') })
  confirm.value.visible = true
}

async function onDelete() {
  if (confirm.value.item) {
    await deleteJobPost(confirm.value.item.id)
    confirm.value.visible = false
    confirm.value.item = null
  }
}

watch([searchQuery, page], () => {
  fetchJobPosts({ search: searchQuery.value || undefined, page: page.value })
}, { immediate: true })

fetchJobPostStats()

watch(() => formModal.value, (val) => {
  if (!val) {
    fetchJobPosts({ search: searchQuery.value || undefined, page: page.value })
    fetchJobPostStats()
  }
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
</style>
