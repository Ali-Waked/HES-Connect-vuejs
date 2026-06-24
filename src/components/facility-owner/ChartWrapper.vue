<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  type: { type: String, default: 'bar' },
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({}) },
  height: { type: String, default: 'h-64' }
})

const canvasRef = ref(null)
let chartInstance = null

function renderChart() {
  if (!canvasRef.value) return
  if (chartInstance) chartInstance.destroy()
  chartInstance = new Chart(canvasRef.value, {
    type: props.type,
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { color: '#94a3b8', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } }
        }
      },
      ...props.options
    }
  })
}

onMounted(renderChart)
onUnmounted(() => { if (chartInstance) chartInstance.destroy() })
watch(() => props.data, renderChart, { deep: true })
</script>

<template>
  <div class="relative" :class="height">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
