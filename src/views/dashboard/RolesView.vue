<script setup>
import { useAccessStore } from '../../stores/access';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import RolesTable from '../../components/dashboard/Access/RolesTable.vue';

const store = useAccessStore();
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Roles Management</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Define and manage user roles and their associated permissions</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatisticsCard 
        title="Total Roles" 
        :value="store.stats.totalRoles" 
        icon="shield_person" 
        color="primary" 
      />
      <StatisticsCard 
        title="Total Permissions" 
        :value="store.stats.totalPermissions" 
        icon="vpn_key" 
        color="info" 
      />
      <StatisticsCard 
        title="Assigned Users" 
        :value="store.stats.totalAssignedUsers" 
        icon="group" 
        color="success" 
      />
    </div>

    <RolesTable />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
