<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStaffStore } from '@/stores/useStaffStore'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import {
  getFacilityMedicines,
  getFacilityMedicine,
  createFacilityMedicine,
  updateFacilityMedicine,
  deleteFacilityMedicine,
  lookupFacilityMedicines,
  getFacilityMedicineStats,
} from '@/services/facilityMedicineService'
import BasePagination from '@/components/dashboard/global/BasePagination.vue'
import BaseDialog from '@/components/dashboard/global/BaseDialog.vue'
import ConfirmModal from '@/components/dashboard/global/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const staffStore = useStaffStore()
const { can } = useAuthPermissions()

// ── List State ──────────────────────────────

const medicines = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0,
})

const search = ref(route.query.search || '')
const currentPage = ref(Number(route.query.page) || 1)
const perPage = ref(Number(route.query.per_page) || 15)

// ── Stats ────────────────────────────────────

const stats = ref({ total_medicines: 0, in_stock: 0, out_of_stock: 0 })
const statsLoading = ref(false)

async function fetchStats() {
  statsLoading.value = true
  try {
    const { data } = await getFacilityMedicineStats()
    stats.value = data.data || { total_medicines: 0, in_stock: 0, out_of_stock: 0 }
  } catch {
    stats.value = { total_medicines: 0, in_stock: 0, out_of_stock: 0 }
  } finally {
    statsLoading.value = false
  }
}

// ── Search ──────────────────────────────────

let searchDebounce = null

function onSearchInput(val) {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    search.value = val
    currentPage.value = 1
    router.replace({ query: { ...route.query, search: val || undefined, page: undefined } })
    fetchMedicines()
  }, 400)
}

watch(() => route.query.search, (val) => {
  const q = val || ''
  if (q !== search.value) {
    search.value = q
    fetchMedicines()
  }
})

// ── Fetch List ──────────────────────────────

async function fetchMedicines() {
  loading.value = true
  error.value = null
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
    }
    if (search.value) params.search = search.value
    const { data } = await getFacilityMedicines(params)
    medicines.value = data.data || []
    if (data.meta) {
      pagination.current_page = data.meta.current_page || 1
      pagination.last_page = data.meta.last_page || 1
      pagination.per_page = data.meta.per_page || 15
      pagination.total = data.meta.total || 0
      pagination.from = data.meta.from || 0
      pagination.to = data.meta.to || 0
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load medicines'
    medicines.value = []
  } finally {
    loading.value = false
  }
}

function onPageChange(page) {
  currentPage.value = page
  router.replace({ query: { ...route.query, page: page > 1 ? page : undefined } })
  fetchMedicines()
}

function onPerPageChange(val) {
  perPage.value = Number(val)
  currentPage.value = 1
  router.replace({ query: { ...route.query, per_page: val !== '15' ? val : undefined, page: undefined } })
  fetchMedicines()
}

// ── Image Preview ───────────────────────────

const previewImageUrl = ref(null)

function openImagePreview(url) {
  previewImageUrl.value = url
}

function closeImagePreview() {
  previewImageUrl.value = null
}

// ── Helpers ─────────────────────────────────

function stockColor(item) {
  if (item.stock === 0) return 'text-red-500'
  if (item.stock <= 20) return 'text-amber-500'
  return 'text-green-600 dark:text-green-400'
}

function stockBadge(item) {
  if (item.stock === 0) return { label: 'Out of Stock', class: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
  if (item.stock <= 20) return { label: 'Low Stock', class: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' }
  return { label: 'In Stock', class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' }
}

function availBadge(item) {
  if (item.is_available) return { label: 'Available', class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' }
  return { label: 'Unavailable', class: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
}

// ── Action Menu ─────────────────────────────

// ── Add Dialog ──────────────────────────────

const showAdd = ref(false)
const addStep = ref(1)
const lookupQuery = ref('')
const lookupResults = ref([])
const lookupLoading = ref(false)
const addSelectedMedicine = ref(null)
const addForm = reactive({ stock: '', price: '', is_available: true })
const addSaving = ref(false)
const addErrors = reactive({})

let lookupDebounce = null

function onLookupInput(val) {
  clearTimeout(lookupDebounce)
  if (!val.trim()) {
    lookupResults.value = []
    return
  }
  lookupDebounce = setTimeout(async () => {
    lookupLoading.value = true
    try {
      const { data } = await lookupFacilityMedicines({ search: val.trim() })
      lookupResults.value = Array.isArray(data) ? data : data.data || data || []
    } catch {
      lookupResults.value = []
    } finally {
      lookupLoading.value = false
    }
  }, 350)
}

function selectMedicine(item) {
  addSelectedMedicine.value = item
  lookupQuery.value = item.name?.en || item.name || item.name_en || ''
  lookupResults.value = []
  addStep.value = 2
}

function resetAddLookup() {
  addSelectedMedicine.value = null
  lookupQuery.value = ''
  lookupResults.value = []
  addStep.value = 1
}

function openAdd() {
  resetAddLookup()
  addForm.stock = ''
  addForm.price = ''
  addForm.is_available = true
  Object.keys(addErrors).forEach(k => delete addErrors[k])
  showAdd.value = true
}

async function handleAddSubmit() {
  Object.keys(addErrors).forEach(k => delete addErrors[k])
  if (!addForm.stock && addForm.stock !== 0) {
    addErrors.stock = 'Stock is required'
    return
  }
  if (!addForm.price && addForm.price !== 0) {
    addErrors.price = 'Price is required'
    return
  }
  addSaving.value = true
  try {
    await createFacilityMedicine({
      medicine_uuid: addSelectedMedicine.value.uuid || addSelectedMedicine.value.id,
      stock: Number(addForm.stock),
      price: Number(addForm.price),
      is_available: addForm.is_available,
    })
    staffStore.showToast('Medicine added to inventory', 'success')
    showAdd.value = false
    fetchMedicines()
    fetchStats()
  } catch (err) {
    if (err.response?.status === 422 && err.response.data?.errors) {
      const serverErrors = err.response.data.errors
      for (const key in serverErrors) {
        addErrors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key]
      }
    } else {
      staffStore.showToast(err.response?.data?.message || 'Failed to add medicine', 'error')
    }
  } finally {
    addSaving.value = false
  }
}

function addError(key) {
  return addErrors[key] || ''
}

// ── Edit Dialog ─────────────────────────────

const showEdit = ref(false)
const editFetching = ref(false)
const editItem = ref(null)
const editForm = reactive({ price: '', is_available: true })
const editSaving = ref(false)
const editErrors = reactive({})

async function openEdit(uuid) {
  Object.keys(editErrors).forEach(k => delete editErrors[k])
  editFetching.value = true
  showEdit.value = true
  try {
    const { data } = await getFacilityMedicine(uuid)
    const item = data.data || data
    editItem.value = item
    editForm.price = item.price ?? ''
    editForm.is_available = item.is_available ?? true
  } catch (err) {
    staffStore.showToast('Failed to load medicine details', 'error')
    showEdit.value = false
  } finally {
    editFetching.value = false
  }
}

async function handleEditSubmit() {
  Object.keys(editErrors).forEach(k => delete editErrors[k])
  if (editForm.price === '' && editForm.price !== 0) {
    editErrors.price = 'Price is required'
    return
  }
  editSaving.value = true
  try {
    await updateFacilityMedicine(editItem.value.uuid, {
      price: Number(editForm.price),
      is_available: editForm.is_available,
    })
    staffStore.showToast('Medicine updated successfully', 'success')
    showEdit.value = false
    fetchMedicines()
    fetchStats()
  } catch (err) {
    if (err.response?.status === 422 && err.response.data?.errors) {
      const serverErrors = err.response.data.errors
      for (const key in serverErrors) {
        editErrors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key]
      }
    } else {
      staffStore.showToast(err.response?.data?.message || 'Failed to update medicine', 'error')
    }
  } finally {
    editSaving.value = false
  }
}

function editError(key) {
  return editErrors[key] || ''
}

// ── Stock Dialog ────────────────────────────

const showStock = ref(false)
const stockFetching = ref(false)
const stockItem = ref(null)
const stockNewValue = ref('')
const stockSaving = ref(false)
const stockError = ref('')

async function openStock(uuid) {
  stockError.value = ''
  stockFetching.value = true
  showStock.value = true
  try {
    const { data } = await getFacilityMedicine(uuid)
    const item = data.data || data
    stockItem.value = item
    stockNewValue.value = item.stock ?? ''
  } catch (err) {
    staffStore.showToast('Failed to load stock details', 'error')
    showStock.value = false
  } finally {
    stockFetching.value = false
  }
}

async function handleStockSubmit() {
  stockError.value = ''
  if (stockNewValue.value === '' && stockNewValue.value !== 0) {
    stockError.value = 'New stock quantity is required'
    return
  }
  stockSaving.value = true
  try {
    await updateFacilityMedicine(stockItem.value.uuid, {
      stock: Number(stockNewValue.value),
    })
    staffStore.showToast('Stock updated successfully', 'success')
    showStock.value = false
    fetchMedicines()
    fetchStats()
  } catch (err) {
    if (err.response?.status === 422 && err.response.data?.errors) {
      const e = err.response.data.errors
      stockError.value = e.stock ? (Array.isArray(e.stock) ? e.stock[0] : e.stock) : 'Failed to update stock'
    } else {
      stockError.value = err.response?.data?.message || 'Failed to update stock'
    }
  } finally {
    stockSaving.value = false
  }
}

// ── Delete ──────────────────────────────────

const showDelete = ref(false)
const deleteItem = ref(null)
const deleteSaving = ref(false)

function confirmDelete(item) {
  deleteItem.value = item
  showDelete.value = true
}

function confirmDeleteById(uuid) {
  const item = medicines.value.find(m => m.uuid === uuid)
  if (item) confirmDelete(item)
}

async function handleDelete() {
  deleteSaving.value = true
  try {
    await deleteFacilityMedicine(deleteItem.value.uuid)
    staffStore.showToast('Medicine removed from inventory', 'success')
    showDelete.value = false
    deleteItem.value = null
    if (medicines.value.length <= 1 && currentPage.value > 1) {
      currentPage.value--
    }
    fetchMedicines()
    fetchStats()
  } catch (err) {
    staffStore.showToast(err.response?.data?.message || 'Failed to delete medicine', 'error')
  } finally {
    deleteSaving.value = false
  }
}

// ── Init ────────────────────────────────────

onMounted(() => {
  fetchMedicines()
  fetchStats()
})
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Medicines</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ pagination.total }} item(s)</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition cursor-pointer"
        @click.stop="openAdd"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Medicine
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-2xl text-sky-600 dark:text-sky-400">medical_services</span>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Total Items</p>
          <h3 v-if="statsLoading" class="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></h3>
          <h3 v-else class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ stats.total_medicines }}</h3>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">checklist</span>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">In Stock</p>
          <h3 v-if="statsLoading" class="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></h3>
          <h3 v-else class="text-3xl font-black text-green-600 dark:text-green-400 tracking-tight">{{ stats.in_stock }}</h3>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-2xl text-red-600 dark:text-red-400">error_outline</span>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Out of Stock</p>
          <h3 v-if="statsLoading" class="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></h3>
          <h3 v-else class="text-3xl font-black text-red-500 tracking-tight">{{ stats.out_of_stock }}</h3>
        </div>
      </div>
    </div>

    <!-- Search & Per Page -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div class="relative w-full sm:w-72">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">search</span>
        <input
          type="text"
          placeholder="Search medicines..."
          :value="search"
          autocomplete="off"
          @input="onSearchInput($event.target.value)"
          class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"
        />
      </div>
      <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>Show</span>
        <select
          :value="String(perPage)"
          @change="onPerPageChange($event.target.value)"
          class="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer"
        >
          <option value="15">15</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span class="hidden sm:inline">entries</span>
      </div>
    </div>

    <!-- Table -->
    <template v-if="loading && medicines.length === 0">
      <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th class="px-5 py-3.5">Image</th>
              <th class="px-5 py-3.5">Medicine Name</th>
              <th class="px-5 py-3.5">Stock</th>
              <th class="px-5 py-3.5">Price</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5 text-right w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 5" :key="i" class="animate-pulse">
              <td class="px-5 py-3"><div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700"></div></td>
              <td class="px-5 py-3"><div class="h-4 w-40 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
              <td class="px-5 py-3"><div class="h-4 w-12 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
              <td class="px-5 py-3"><div class="h-4 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div></td>
              <td class="px-5 py-3"><div class="h-5 w-20 bg-slate-100 dark:bg-slate-700 rounded-full"></div></td>
              <td class="px-5 py-3"><div class="h-7 w-7 bg-slate-100 dark:bg-slate-700 rounded-lg ml-auto"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Error State -->
    <div v-else-if="error && !loading" class="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 text-center">
      <span class="material-symbols-outlined text-3xl text-red-400">error_outline</span>
      <p class="mt-2 text-sm font-semibold text-red-700 dark:text-red-400">{{ error }}</p>
      <button class="mt-3 rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition cursor-pointer" @click="fetchMedicines">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && medicines.length === 0" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
      <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">medication</span>
      <p class="mt-3 text-lg font-bold text-slate-900 dark:text-white">No medicines found</p>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or add a new medicine to the inventory.</p>
      <button
        class="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark transition cursor-pointer"
        @click="openAdd"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        Add Medicine
      </button>
    </div>

    <!-- Table Data -->
    <template v-else>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th class="px-5 py-3.5 w-14">Image</th>
              <th class="px-5 py-3.5">Medicine Name</th>
              <th class="px-5 py-3.5">Stock</th>
              <th class="px-5 py-3.5">Price</th>
              <th class="px-5 py-3.5">Availability</th>
              <th class="px-5 py-3.5 w-16"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 dark:divide-slate-700/50">
            <tr v-for="item in medicines" :key="item.uuid" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
              <td class="px-5 py-3">
                <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 overflow-hidden flex items-center justify-center">
                  <img v-if="item.medicine?.image_url" :src="item.medicine.image_url" :alt="item.medicine?.name" class="w-full h-full object-cover cursor-pointer" @click="openImagePreview(item.medicine.image_url)" />
                  <span v-else class="material-symbols-outlined text-lg text-slate-400">medical_services</span>
                </div>
              </td>
              <td class="px-5 py-3">
                <span class="font-semibold text-slate-900 dark:text-white">{{ item.medicine?.name || '—' }}</span>
              </td>
              <td class="px-5 py-3">
                <button class="font-bold cursor-pointer hover:underline text-left" :class="stockColor(item)" @click="openStock(item.uuid)">
                  {{ item.stock ?? 0 }} Units
                </button>
                <span class="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold" :class="stockBadge(item).class">{{ stockBadge(item).label }}</span>
              </td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400 font-semibold">
                <span v-if="item.price != null">${{ Number(item.price).toFixed(2) }}</span>
                <span v-else class="text-slate-300 dark:text-slate-600">—</span>
              </td>
              <td class="px-5 py-3">
                <span class="rounded-full px-2.5 py-0.5 text-[11px] font-bold" :class="availBadge(item).class">{{ availBadge(item).label }}</span>
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition cursor-pointer" @click="openEdit(item.uuid)" title="Edit">
                    <span class="material-symbols-outlined text-[18px] text-sky-500">edit</span>
                  </button>
                  <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer" @click="confirmDelete(item)" title="Delete">
                    <span class="material-symbols-outlined text-[18px] text-red-500">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="pagination.last_page > 1"
        :current-page="pagination.current_page"
        :total-pages="pagination.last_page"
        :total-items="pagination.total"
        :items-per-page="pagination.per_page"
        @change="onPageChange"
      />
    </template>

    <!-- ═══ Add Medicine Dialog ═══════════════ -->
    <BaseDialog :show="showAdd" title="Add Medicine" size="md" @close="showAdd = false">
      <!-- Step 1: Lookup -->
      <div v-if="addStep === 1" class="space-y-4">
        <p class="text-sm text-slate-500 dark:text-slate-400">Search for a medicine to add to the facility inventory.</p>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">search</span>
          <input
            v-model="lookupQuery"
            type="text"
            placeholder="Search for a medicine..."
            autocomplete="off"
            @input="onLookupInput($event.target.value)"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"
          />
          <div v-if="lookupLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
            <svg class="w-4 h-4 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
        <div v-if="lookupResults.length > 0" class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
          <div
            v-for="item in lookupResults"
            :key="item.uuid || item.id"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition border-b border-slate-100 dark:border-slate-700 last:border-0"
            @click="selectMedicine(item)"
          >
            <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 flex items-center justify-center">
              <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
              <span v-else class="material-symbols-outlined text-sm text-slate-400">medical_services</span>
            </div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ item.name?.en || item.name || item.name_en || '—' }}</p>
          </div>
        </div>
        <div v-if="lookupQuery.trim() && !lookupLoading && lookupResults.length === 0" class="text-center py-6">
          <span class="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">search_off</span>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">No medicines found</p>
        </div>
      </div>

      <!-- Step 2: Stock / Price / Availability -->
      <div v-else class="space-y-5">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
          <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 flex items-center justify-center">
            <img v-if="addSelectedMedicine?.image_url" :src="addSelectedMedicine.image_url" class="w-full h-full object-cover" />
            <span v-else class="material-symbols-outlined text-sm text-slate-400">medical_services</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ addSelectedMedicine?.name?.en || addSelectedMedicine?.name || addSelectedMedicine?.name_en || '—' }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500">Selected medicine</p>
          </div>
          <button class="ml-auto text-xs font-bold text-brand-primary hover:text-brand-primary-dark transition cursor-pointer" @click="resetAddLookup">Change</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Initial Stock <span class="text-red-500">*</span></label>
            <input v-model="addForm.stock" type="number" min="0" placeholder="e.g. 100" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" />
            <p v-if="addError('stock')" class="mt-1 text-[11px] font-bold text-rose-500 uppercase tracking-tight">{{ addError('stock') }}</p>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Price <span class="text-red-500">*</span></label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-semibold">$</span>
              <input v-model="addForm.price" type="number" min="0" step="0.01" placeholder="0.00" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-7 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" />
            </div>
            <p v-if="addError('price')" class="mt-1 text-[11px] font-bold text-rose-500 uppercase tracking-tight">{{ addError('price') }}</p>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Available</label>
            <button type="button" class="relative w-11 h-6 rounded-full transition cursor-pointer" :class="addForm.is_available ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'" @click="addForm.is_available = !addForm.is_available">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform" :class="addForm.is_available ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="showAdd = false">Cancel</button>
        <button
          v-if="addStep === 2"
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          :disabled="addSaving"
          @click="handleAddSubmit"
        >
          <svg v-if="addSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ addSaving ? 'Adding...' : 'Add to Inventory' }}
        </button>
      </template>
    </BaseDialog>

    <!-- ═══ Edit Medicine Dialog ══════════════ -->
    <BaseDialog :show="showEdit" title="Edit Medicine" size="sm" @close="showEdit = false">
      <div v-if="editFetching" class="py-8 text-center">
        <svg class="w-6 h-6 animate-spin mx-auto text-brand-primary" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading medicine details...</p>
      </div>
      <div v-else-if="editItem" class="space-y-5">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
          <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 flex items-center justify-center">
            <img v-if="editItem.medicine?.image_url" :src="editItem.medicine.image_url" class="w-full h-full object-cover" />
            <span v-else class="material-symbols-outlined text-sm text-slate-400">medical_services</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ editItem.medicine?.name || '—' }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500">Current stock: {{ editItem.stock ?? 0 }} units</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Price <span class="text-red-500">*</span></label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-semibold">$</span>
            <input v-model="editForm.price" type="number" min="0" step="0.01" placeholder="0.00" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-7 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition" />
          </div>
          <p v-if="editError('price')" class="mt-1 text-[11px] font-bold text-rose-500 uppercase tracking-tight">{{ editError('price') }}</p>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Available</label>
          <button type="button" class="relative w-11 h-6 rounded-full transition cursor-pointer" :class="editForm.is_available ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'" @click="editForm.is_available = !editForm.is_available">
            <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform" :class="editForm.is_available ? 'translate-x-5' : 'translate-x-0'"></span>
          </button>
        </div>
      </div>

      <template #footer>
        <button type="button" class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="showEdit = false">Cancel</button>
        <button
          v-if="!editFetching"
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          :disabled="editSaving"
          @click="handleEditSubmit"
        >
          <svg v-if="editSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ editSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </template>
    </BaseDialog>

    <!-- ═══ Stock Management Dialog ═══════════ -->
    <BaseDialog :show="showStock" title="Update Stock" size="sm" @close="showStock = false">
      <div v-if="stockFetching" class="py-8 text-center">
        <svg class="w-6 h-6 animate-spin mx-auto text-brand-primary" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading stock details...</p>
      </div>
      <div v-else-if="stockItem" class="space-y-5">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
          <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 flex items-center justify-center">
            <img v-if="stockItem.medicine?.image_url" :src="stockItem.medicine.image_url" class="w-full h-full object-cover" />
            <span v-else class="material-symbols-outlined text-sm text-slate-400">medical_services</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ stockItem.medicine?.name || '—' }}</p>
            <p class="text-xs text-slate-400 dark:text-slate-500">Current stock: <strong class="text-slate-700 dark:text-slate-300">{{ stockItem.stock ?? 0 }}</strong> units</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Stock Quantity <span class="text-red-500">*</span></label>
          <input v-model="stockNewValue" type="number" min="0" placeholder="Enter new quantity" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-4 text-2xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition text-center" />
          <p v-if="stockError" class="mt-1 text-[11px] font-bold text-rose-500 uppercase tracking-tight">{{ stockError }}</p>
        </div>
      </div>

      <template #footer>
        <button type="button" class="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="showStock = false">Cancel</button>
        <button
          v-if="!stockFetching"
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          :disabled="stockSaving"
          @click="handleStockSubmit"
        >
          <svg v-if="stockSaving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ stockSaving ? 'Updating...' : 'Update Stock' }}
        </button>
      </template>
    </BaseDialog>

    <!-- ═══ Delete Confirmation ═══════════════ -->
    <ConfirmModal
      :show="showDelete"
      title="Delete Medicine"
      :message="`Are you sure you want to remove <strong>${deleteItem?.medicine?.name || 'this medicine'}</strong> from the facility inventory? This action cannot be undone.`"
      confirm-text="Delete"
      :is-danger="true"
      @confirm="handleDelete"
      @close="showDelete = false; deleteItem = null"
    />

    <!-- ═══ Image Preview ═════════════════════ -->
    <div
      v-if="previewImageUrl"
      class="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4"
      @click="closeImagePreview"
    >
      <button
        class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
        @click="closeImagePreview"
      >
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>
      <img
        :src="previewImageUrl"
        alt="Medicine image"
        class="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
        @click.stop
      />
    </div>
  </div>
</template>
