<script setup>
import { useAccessStore } from '../../stores/access';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import PermissionsTable from '../../components/dashboard/Access/PermissionsTable.vue';

const store = useAccessStore();
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">System Permissions</h1>
        <p class="text-sm text-slate-500">Atomic access control units used to build roles</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <StatisticsCard 
        title="Total Permissions" 
        :value="store.stats.totalPermissions" 
        icon="vpn_key" 
        color="info" 
      />
      <StatisticsCard 
        title="Used In Roles" 
        :value="store.roles.length" 
        icon="shield_person" 
        color="primary" 
      />
    </div>

    <PermissionsTable />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
