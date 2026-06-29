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

const nonScalesTypes = ['doughnut', 'pie', 'polarArea', 'radar', 'bubble', 'scatter']

function renderChart() {
  if (!canvasRef.value) return
  if (chartInstance) chartInstance.destroy()
  const isNonScales = nonScalesTypes.includes(props.type)
  const defaultOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  }
  if (!isNonScales) {
    defaultOpts.scales = {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { color: '#94a3b8', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } }
      }
    }
  }
  chartInstance = new Chart(canvasRef.value, {
    type: props.type,
    data: props.data,
    options: {
      ...defaultOpts,
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
