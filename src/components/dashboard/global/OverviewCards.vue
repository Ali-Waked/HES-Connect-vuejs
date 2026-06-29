<script setup>
import StatisticsCard from './StatisticsCard.vue';
import GrowthBadge from './GrowthBadge.vue';

defineProps({
  overview: { type: Object, required: true },
  growthPercentages: { type: Object, default: () => ({}) },
});

function toTitle(str) {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const iconMap = {
  total_reports: 'assessment',
  total_patients: 'patient_list',
  total_appointments: 'calendar_month',
  total_revenue: 'payments',
  total_prescriptions: 'description',
  total_medications: 'medication',
  total_staff: 'group',
  total_facilities: 'home_health',
  total_articles: 'article',
  total_reviews: 'star',
};

const colorMap = {
  total_reports: 'primary',
  total_patients: 'success',
  total_appointments: 'info',
  total_revenue: 'warning',
  total_prescriptions: 'info',
  total_medications: 'success',
  total_staff: 'primary',
  total_facilities: 'warning',
  total_articles: 'primary',
  total_reviews: 'warning',
};

function getIcon(key) {
  return iconMap[key] || 'bar_chart';
}

function getColor(key) {
  return colorMap[key] || 'neutral';
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="(value, key) in overview"
      :key="key"
      class="relative"
    >
      <StatisticsCard
        :title="toTitle(key)"
        :value="value"
        :icon="getIcon(key)"
        :color="getColor(key)"
      />
      <div
        v-if="growthPercentages[key] !== undefined"
        class="absolute top-3 right-3"
      >
        <GrowthBadge :value="growthPercentages[key]" />
      </div>
    </div>
  </div>
</template>
