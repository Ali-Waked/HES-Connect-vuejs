<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMedicinesStore } from '@/stores/medicines'
import MedicinesTable from '@/components/dashboard/Medicines/MedicinesTable.vue'

const { t } = useI18n()
const store = useMedicinesStore()

onMounted(() => {
  store.fetchMedicines({ page: 1, per_page: 10, sort_by: 'created_at', sort_order: 'desc' })
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('pageTitles.pharmaceuticalRegistry') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ store.pagination.total || 0 }} registered medicines</p>
      </div>
    </div>

    <MedicinesTable />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
