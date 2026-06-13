<template>
  <div class="animate-fade-in space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Inventory</h2>
        <p class="text-sm text-slate-500">Medicine stock management</p>
      </div>
      <div class="flex gap-2">
        <input v-model="search" placeholder="Search medicine..." class="rounded-lg border border-slate-200 px-3 py-2 text-sm w-48" />
        <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="addModal = true">+ Add to Inventory</button>
      </div>
    </div>

    <div class="flex gap-2">
      <button v-for="f in filters" :key="f.key" class="rounded-md px-4 py-2 text-sm font-semibold transition" :class="activeFilter === f.key ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" @click="activeFilter = f.key">{{ f.label }}</button>
    </div>

    <DataTable :columns="columns" :items="filtered" :loading="loading" empty-title="No items found">
      <template #cell-quantity="{ item }">
        <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold" :class="qtyClass(item.quantity)">{{ item.quantity }}</span>
      </template>
      <template #cell-price="{ item }">
        <span>${{ item.price.toFixed(2) }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="flex gap-2">
          <button class="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700" @click="editItem(item)">Edit</button>
          <button class="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600" @click="confirmDelete(item)">Delete</button>
        </div>
      </template>
    </DataTable>

    <InventoryFormModal :show="addModal" @close="addModal = false" />
    <InventoryEditModal :show="editModal" :item-id="editId" @close="editModal = false" />
    <ConfirmModal v-model:modelValue="confirm.visible" title="Delete Item" :message="confirm.message" confirmText="Delete" @confirm="onDelete" @cancel="confirm.visible = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import DataTable from '@/components/staff/shared/DataTable.vue'
import InventoryFormModal from '@/components/staff/modals/InventoryFormModal.vue'
import InventoryEditModal from '@/components/staff/modals/InventoryEditModal.vue'
import ConfirmModal from '@/components/staff/modals/ConfirmModal.vue'

const store = useStaffStore()
const loading = ref(true)
const search = ref('')
const activeFilter = ref('all')
const addModal = ref(false)
const editModal = ref(false)
const editId = ref(null)

const filters = [
  { key: 'all', label: 'All' },
  { key: 'low', label: 'Low (<10)' },
  { key: 'medium', label: 'Medium (10–20)' },
  { key: 'good', label: 'Good (>20)' }
]

const columns = [
  { key: 'medicineName', label: 'Medicine' },
  { key: 'description', label: 'Description' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'price', label: 'Price' },
  { key: 'actions', label: 'Actions' }
]

const filtered = computed(() => {
  let items = store.inventory
  if (activeFilter.value === 'low') items = items.filter(i => i.quantity < 10)
  else if (activeFilter.value === 'medium') items = items.filter(i => i.quantity >= 10 && i.quantity <= 20)
  else if (activeFilter.value === 'good') items = items.filter(i => i.quantity > 20)
  if (search.value) items = items.filter(i => i.medicineName.toLowerCase().includes(search.value.toLowerCase()))
  return items
})

function qtyClass(qty) {
  if (qty < 10) return 'bg-red-100 text-red-700'
  if (qty <= 20) return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

function editItem(item) { editId.value = item.id; editModal.value = true }

const confirm = ref({ visible: false, item: null, message: '' })
function confirmDelete(item) { confirm.value.item = item; confirm.value.message = `Delete ${item.medicineName} from inventory?`; confirm.value.visible = true }
function onDelete() { if (confirm.value.item) { store.deleteInventoryItem(confirm.value.item.id); store.showToast('Item deleted', 'success') } }

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
