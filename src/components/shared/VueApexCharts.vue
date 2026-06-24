<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  options: { type: Object, default: () => ({}) },
  series: { type: Array, default: () => [] },
  type: { type: String, default: 'line' },
  height: { type: [Number, String], default: 350 },
  width: { type: [Number, String], default: '100%' },
})

let chart = null
const chartRef = ref(null)

async function initChart() {
  if (!chartRef.value) return
  const ApexCharts = (await import('apexcharts')).default
  if (chart) chart.destroy()
  chart = new ApexCharts(chartRef.value, {
    chart: { type: props.type, height: props.height, width: props.width, toolbar: { show: false } },
    ...props.options,
    series: props.series,
  })
  chart.render()
}

watch(() => [props.series, props.options], initChart, { deep: true })
onMounted(initChart)
onUnmounted(() => { if (chart) chart.destroy() })
</script>

<template>
  <div ref="chartRef" class="apexcharts-wrapper"></div>
</template>
