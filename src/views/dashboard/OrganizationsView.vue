<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OrganizationStatsCards from '../../components/dashboard/Organizations/OrganizationStatsCards.vue'
import OrganizationsTable from '../../components/dashboard/Organizations/OrganizationsTable.vue'

const { t } = useI18n()
const totalOrganizations = ref(0)

function onStatsLoaded(stats) {
  totalOrganizations.value = stats?.total_organizations ?? 0
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {{ t('organizations.title') }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ totalOrganizations }} {{ t('organizations.registered') }}
        </p>
      </div>
    </div>

    <OrganizationStatsCards @loaded="onStatsLoaded" />

    <OrganizationsTable />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
