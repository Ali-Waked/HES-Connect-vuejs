<script setup>
import { useTagsStore } from '../../stores/tags';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import TagsTable from '../../components/dashboard/Tags/TagsTable.vue';

const store = useTagsStore();
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Tags Management</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Categorize and organize platform content with dynamic tags</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatisticsCard 
        title="Total Tags" 
        :value="store.stats.totalTags" 
        icon="tag" 
        color="primary" 
      />
      <StatisticsCard 
        v-for="tag in store.stats.mostUsed"
        :key="tag.id"
        :title="`Most Used: #${tag.name}`"
        :value="tag.count"
        icon="trending_up"
        color="success"
        subtitle="Usage in articles"
      />
    </div>

    <TagsTable />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
