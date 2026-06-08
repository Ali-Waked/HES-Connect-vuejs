<template>
  <StaffModalShell :show="show" title="Edit Inventory Item" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Medicine Name</label>
        <input v-model="name" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm" readonly />
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
        <textarea v-model="description" rows="2" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity</label>
          <input type="number" v-model.number="quantity" min="0" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Price ($)</label>
          <input type="number" v-model.number="price" min="0" step="0.01" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" required />
        </div>
      </div>
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300" @click="$emit('close')">Cancel</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white">Save</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'

const props = defineProps({ show: Boolean, itemId: Number })
const emit = defineEmits(['close'])
const store = useStaffStore()
const item = computed(() => store.inventory.find(i => i.id === props.itemId))
const name = ref('')
const description = ref('')
const quantity = ref(0)
const price = ref(0)
const error = ref('')

watch(() => props.show, (v) => {
  if (v && item.value) { name.value = item.value.medicineName; description.value = item.value.description; quantity.value = item.value.quantity; price.value = item.value.price }
})

function submit() {
  if (quantity.value < 0 || price.value < 0) { error.value = 'Invalid values'; return }
  store.updateInventoryItem(props.itemId, { description: description.value, quantity: quantity.value, price: price.value })
  store.showToast('Inventory updated', 'success')
  emit('close')
}
</script>
