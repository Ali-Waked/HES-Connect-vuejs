<script setup>
import { computed } from 'vue';
import ChartWrapper from '@/components/facility-owner/ChartWrapper.vue';
import SectionHeader from './SectionHeader.vue';

const props = defineProps({
  chart: { type: Object, required: true }
});

const chartType = computed(() => {
  const t = props.chart.type || 'bar';
  if (t === 'horizontalBar') return 'bar';
  return t;
});

const isPieLike = computed(() =>
  ['doughnut', 'pie', 'polarArea', 'radar'].includes(chartType.value)
);

const chartData = computed(() => {
  const c = props.chart;
  return {
    labels: c.labels || [],
    datasets: (c.datasets || []).map((ds) => ({
      label: ds.label || '',
      data: ds.data || [],
      backgroundColor: ds.backgroundColor || ds.color || '#0ea5e9',
      borderColor: ds.borderColor || ds.backgroundColor || '#0ea5e9',
      borderWidth: ds.borderWidth ?? (chartType.value === 'line' ? 2 : 0),
      fill: ds.fill ?? (chartType.value === 'line' ? false : undefined),
      tension: ds.tension ?? 0.3,
      borderRadius: 6,
      barPercentage: 0.6,
      categoryPercentage: 0.8,
    })),
  };
});

const chartOptions = computed(() => {
  if (isPieLike.value) {
    return {
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { usePointStyle: true, padding: 16, font: { size: 11 } },
        },
      },
      cutout: chartType.value === 'doughnut' ? '60%' : undefined,
    };
  }

  const opts = {
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend:
        (props.chart.datasets || []).length > 1
          ? {
              display: true,
              position: 'top',
              labels: { usePointStyle: true, padding: 16, font: { size: 11 } },
            }
          : { display: false },
    },
  };

  if (props.chart.type === 'horizontalBar') {
    opts.indexAxis = 'y';
  }

  return opts;
});
</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
    <SectionHeader :title="chart.title || ''" :subtitle="chart.subtitle || ''" />
    <div
      class="mt-4"
      :class="isPieLike ? 'h-64' : 'h-72'"
    >
      <ChartWrapper
        :type="chartType"
        :data="chartData"
        :options="chartOptions"
        :height="isPieLike ? 'h-64' : 'h-72'"
      />
    </div>
  </div>
</template>
