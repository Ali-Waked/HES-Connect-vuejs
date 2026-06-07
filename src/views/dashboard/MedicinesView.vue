<script setup>
import { useMedicinesStore } from '../../stores/medicines';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import MedicinesTable from '../../components/dashboard/Medicines/MedicinesTable.vue';

const store = useMedicinesStore();
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Pharmaceutical Registry</h1>
        <p class="text-sm text-slate-500 mt-1 font-medium">Platform-wide inventory of approved medical drugs and supplies</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatisticsCard title="Total Registry" :value="store.stats.total" icon="medication" color="primary" />
      <StatisticsCard title="Added This Month" :value="store.stats.addedThisMonth" icon="new_releases" color="success" />
      <StatisticsCard title="Critical Stock" value="14" icon="warning" color="danger" />
      <StatisticsCard title="Active Facilities" value="32" icon="home_health" color="info" />
    </div>

    <MedicinesTable />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
