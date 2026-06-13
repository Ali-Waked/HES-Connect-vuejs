<template>
  <StaffModalShell :show="show" :title="$t('common.add') + ' ' + $t('medicines.title')" @close="$emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('medicines.name') }} (EN)</label>
          <input v-model="name_en" dir="ltr" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700 text-right">{{ $t('medicines.name') }} (AR)</label>
          <input v-model="name_ar" dir="rtl" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm text-right" required />
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('common.description') }} (EN)</label>
        <textarea v-model="description_en" dir="ltr" rows="2" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm"></textarea>
      </div>
      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700 text-right">{{ $t('common.description') }} (AR)</label>
        <textarea v-model="description_ar" dir="rtl" rows="2" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm text-right"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('medicines.quantity') }}</label>
          <input type="number" v-model.number="quantity" min="0" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-slate-700">{{ $t('common.price') }} ($)</label>
          <input type="number" v-model.number="price" min="0" step="0.01" class="w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 py-2.5 text-sm" required />
        </div>
      </div>
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 cursor-pointer" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button type="submit" class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white cursor-pointer">{{ $t('common.add') }}</button>
      </div>
    </form>
  </StaffModalShell>
</template>

<script setup>
import { ref } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StaffModalShell from './StaffModalShell.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { t } = useI18n()
const store = useStaffStore()
const name_en = ref('')
const name_ar = ref('')
const description_en = ref('')
const description_ar = ref('')
const quantity = ref(0)
const price = ref(0)
const error = ref('')

function submit() {
  if (!name_en.value || !name_ar.value || quantity.value < 0 || price.value < 0) { 
    error.value = 'Please fill all fields'; return 
  }
  store.addInventoryItem({ 
    medicineName_en: name_en.value, 
    medicineName_ar: name_ar.value, 
    description_en: description_en.value, 
    description_ar: description_ar.value, 
    quantity: quantity.value, 
    price: price.value 
  })
  store.showToast('Item added to inventory', 'success')
  emit('close')
}
</script>
