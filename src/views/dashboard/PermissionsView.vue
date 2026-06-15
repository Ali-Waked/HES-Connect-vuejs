<script setup>
import { useI18n } from 'vue-i18n'
import PermissionsTable from '../../components/dashboard/Access/PermissionsTable.vue';

const { t } = useI18n()
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ t('pageTitles.systemPermissions') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('pageTitles.permissionsDesc') }}</p>
      </div>
    </div>

    <PermissionsTable />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
