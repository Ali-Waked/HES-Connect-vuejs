<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useLocaleField } from '@/composables/useLocaleField'
import { useFormatDate } from '@/composables/useFormatDate'
import { useFacilities } from '../composables/useFacilities'
import { useDataTable } from '@/shared/composables/useDataTable'
import { useToast } from '@/shared/composables/useToast'
import PageHeader from '@/shared/components/PageHeader.vue'
import EmptyState from '@/shared/components/EmptyState.vue'
import FacilityFormDialog from '../components/FacilityFormDialog.vue'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'

const { t } = useI18n()
const router = useRouter()
const { localField } = useLocaleField()
const { formatDate } = useFormatDate()
const facilities = useFacilities()
const toast = useToast()

const formDialog = ref(null)
const confirmDialog = ref(null)
const editingId = ref(null)
const deletingId = ref(null)

const table = useDataTable({
  fetchFn: (params) => facilities.loadItems(params),
  defaultSort: 'created_at',
})

const statsCards = ref([
  { label: 'Total Facilities', key: 'total', color: 'blue' },
  { label: 'Active', key: 'active', color: 'green' },
  { label: 'Pending', key: 'pending', color: 'amber' },
  { label: 'Suspended', key: 'suspended', color: 'red' },
])

async function openCreate() {
  editingId.value = null
  formDialog.value?.show()
}

async function openEdit(facility) {
  editingId.value = facility.uuid || facility.id
  await facilities.loadItem(editingId.value)
  formDialog.value?.show()
}

function openDetail(facility) {
  router.push(`/platform/facilities/${facility.uuid || facility.id}`)
}

function confirmDelete(facility) {
  deletingId.value = facility.uuid || facility.id
  confirmDialog.value?.show()
}

async function handleDelete() {
  try {
    await facilities.deleteItem(deletingId.value)
    toast.success('Facility deleted successfully.')
    confirmDialog.value?.hide()
    await table.load()
  } catch {
    toast.error('Failed to delete facility.')
  }
}

async function handleSave(data) {
  try {
    await facilities.saveItem(data, editingId.value)
    toast.success(editingId.value ? 'Facility updated successfully.' : 'Facility created successfully.')
    formDialog.value?.hide()
    await table.load()
  } catch {
    /* errors handled by composable */
  }
}

onMounted(() => {
  facilities.loadStats()
})
</script>

<template>
  <div>
    <PageHeader title="Facilities" subtitle="Manage all healthcare facilities across the platform">
      <template #actions>
        <button
          class="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
          @click="openCreate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Facility
        </button>
      </template>
    </PageHeader>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        v-for="card in statsCards"
        :key="card.key"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 transition hover:shadow-sm"
      >
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{{ card.label }}</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ facilities.stats[card.key] ?? 0 }}</p>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            v-model="table.search"
            type="text"
            placeholder="Search facilities..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
            @input="table.load(1)"
          />
        </div>
        <select
          v-model="table.filters.value.status"
          class="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
          @change="table.applyFilters({ status: table.filters.value.status })"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <th class="px-6 py-4 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none" @click="table.sort('name')">
                <span class="inline-flex items-center gap-1">Name</span>
              </th>
              <th class="px-6 py-4 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
              <th class="px-6 py-4 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">City</th>
              <th class="px-6 py-4 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" @click="table.sort('created_at')">
                <span class="inline-flex items-center gap-1 cursor-pointer select-none">Created</span>
              </th>
              <th class="px-6 py-4 text-right text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <!-- Loading -->
            <tr v-if="table.loading.value" v-for="i in 5" :key="i">
              <td v-for="col in 6" :key="col" class="px-6 py-4.5">
                <div class="h-4 bg-slate-100 dark:bg-slate-700 rounded-md w-3/4 animate-pulse"></div>
              </td>
            </tr>
            <!-- Empty -->
            <tr v-else-if="table.items.value.length === 0">
              <td colspan="6" class="px-6 py-12">
                <EmptyState
                  title="No facilities found"
                  description="Facilities will appear here once they are registered on the platform."
                  action-label="Add Facility"
                  @click="openCreate"
                />
              </td>
            </tr>
            <!-- Data -->
            <tr
              v-for="facility in table.items.value"
              :key="facility.uuid || facility.id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
              @click="openDetail(facility)"
            >
              <td class="px-6 py-4.5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 flex items-center justify-center text-sm font-bold text-brand-primary shrink-0">
                    {{ (localField(facility.name) || 'F').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ localField(facility.name) || 'Unnamed' }}</p>
                    <p v-if="facility.email" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ facility.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4.5">
                <span class="text-sm text-slate-600 dark:text-slate-400">{{ localField(facility.facility_type) || '—' }}</span>
              </td>
              <td class="px-6 py-4.5">
                <span class="text-sm text-slate-600 dark:text-slate-400">{{ localField(facility.city?.name) || '—' }}</span>
              </td>
              <td class="px-6 py-4.5">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold leading-5"
                  :class="facility.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : facility.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'"
                >
                  {{ facility.status || 'unknown' }}
                </span>
              </td>
              <td class="px-6 py-4.5 text-sm text-slate-500 dark:text-slate-400">{{ formatDate(facility.created_at) }}</td>
              <td class="px-6 py-4.5 text-right">
                <div class="flex items-center justify-end gap-1" @click.stop>
                  <button
                    class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                    title="Edit"
                    @click="openEdit(facility)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition cursor-pointer"
                    title="Delete"
                    @click="confirmDelete(facility)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="table.lastPage.value > 1" class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Page {{ table.pagination.value.currentPage }} of {{ table.lastPage.value }} ({{ table.totalItems.value }} total)
        </p>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            :disabled="table.pagination.value.currentPage <= 1"
            @click="table.load(table.pagination.value.currentPage - 1)"
          >
            Previous
          </button>
          <button
            class="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            :disabled="table.pagination.value.currentPage >= table.lastPage.value"
            @click="table.load(table.pagination.value.currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <FacilityFormDialog ref="formDialog" :facility-id="editingId" @save="handleSave" @close="formDialog?.hide()" />
    <ConfirmDialog
      ref="confirmDialog"
      title="Delete Facility"
      message="Are you sure you want to delete this facility? This action cannot be undone."
      confirm-label="Delete"
      variant="danger"
      @confirm="handleDelete"
    />
  </div>
</template>
