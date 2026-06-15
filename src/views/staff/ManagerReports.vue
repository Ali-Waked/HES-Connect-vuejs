<template>
  <div class="animate-fade-in space-y-6">
    <div>
      <h2 class="text-xl font-bold text-slate-900">Reports</h2>
      <p class="text-sm text-slate-500">Analytics and insights</p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-64 w-full animate-pulse rounded-xl bg-slate-100"></div>
    </div>

    <template v-else>
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Appointments by Status</h3>
        <div class="flex flex-col sm:flex-row items-center gap-8">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <g v-for="(seg, i) in donutSegments" :key="i">
              <path :d="seg.path" :fill="seg.color" />
            </g>
            <circle cx="90" cy="90" r="50" fill="white" />
            <text x="90" y="85" text-anchor="middle" font-size="22" font-weight="bold" fill="#0f172a">{{ totalAppts }}</text>
            <text x="90" y="105" text-anchor="middle" font-size="11" fill="#64748b">Total</text>
          </svg>
          <div class="space-y-2">
            <div v-for="leg in legend" :key="leg.label" class="flex items-center gap-2 text-sm">
              <span class="h-3 w-3 rounded-full" :style="{ background: leg.color }"></span>
              <span class="text-slate-700">{{ leg.label }}</span>
              <span class="font-bold">{{ leg.count }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Staff by Specialization</h3>
        <div class="space-y-3">
          <div v-for="bar in specBars" :key="bar.label" class="flex items-center gap-3">
            <span class="w-32 text-sm text-slate-700">{{ bar.label }}</span>
            <div class="flex-1 h-6 rounded-md bg-slate-100">
              <div class="h-6 rounded-md bg-brand-primary transition-all" :style="{ width: bar.percent + '%' }"></div>
            </div>
            <span class="w-8 text-sm font-bold text-slate-700">{{ bar.count }}</span>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Reviews Over Time</h3>
        <svg viewBox="0 0 400 200" class="w-full">
          <text x="20" y="30" font-size="10" fill="#94a3b8">5.0</text>
          <text x="20" y="80" font-size="10" fill="#94a3b8">4.5</text>
          <text x="20" y="130" font-size="10" fill="#94a3b8">4.0</text>
          <text x="20" y="175" font-size="10" fill="#94a3b8">3.5</text>
          <line x1="40" y1="20" x2="40" y2="175" stroke="#e2e8f0" stroke-width="1" />
          <line x1="40" y1="175" x2="380" y2="175" stroke="#e2e8f0" stroke-width="1" />
          <polyline :points="linePoints" fill="none" stroke="#027a75" stroke-width="2.5" stroke-linejoin="round" />
          <g v-for="(pt, i) in lineData" :key="i">
            <circle :cx="pt.x" :cy="pt.y" r="4" fill="#027a75" />
            <text :x="pt.x" y="190" font-size="9" text-anchor="middle" fill="#64748b">{{ pt.label }}</text>
          </g>
        </svg>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { resolveTranslatedValue } from '@/utils/locale'

const store = useStaffStore()
const loading = ref(true)

const totalAppts = computed(() => store.appointments.length)
const statusCounts = computed(() => {
  const counts = { booked: 0, completed: 0, cancelled: 0, rescheduled: 0 }
  store.appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++ })
  return counts
})

const colors = { booked: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444', rescheduled: '#f59e0b' }
const statusLabels = { booked: 'Booked', completed: 'Completed', cancelled: 'Cancelled', rescheduled: 'Rescheduled' }

const legend = computed(() => Object.entries(statusCounts.value).filter(([_, c]) => c > 0).map(([key, count]) => ({ label: statusLabels[key], count, color: colors[key] })))

const donutSegments = computed(() => {
  const total = Object.values(statusCounts.value).reduce((s, c) => s + c, 0) || 1
  let offset = 0
  const segments = []
  Object.entries(statusCounts.value).forEach(([key, count]) => {
    if (count === 0) return
    const percent = count / total
    const angle = percent * 360
    const startAngle = offset
    const endAngle = offset + angle
    const r = 65, cx = 90, cy = 90
    const x1 = cx + r * Math.cos((startAngle - 90) * Math.PI / 180)
    const y1 = cy + r * Math.sin((startAngle - 90) * Math.PI / 180)
    const x2 = cx + r * Math.cos((endAngle - 90) * Math.PI / 180)
    const y2 = cy + r * Math.sin((endAngle - 90) * Math.PI / 180)
    const large = angle > 180 ? 1 : 0
    segments.push({ path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`, color: colors[key] })
    offset += angle
  })
  return segments
})

const specBars = computed(() => {
  const map = {}
  store.facilityStaff.forEach(s => { const sp = resolveTranslatedValue(s.specialization); map[sp] = (map[sp] || 0) + 1 })
  const total = Object.values(map).reduce((s, c) => s + c, 0) || 1
  return Object.entries(map).map(([label, count]) => ({ label, count, percent: (count / total) * 100 }))
})

const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
const mockRatings = [4.8, 4.5, 4.7, 4.2, 4.6, 4.9]

const lineData = computed(() => {
  const minY = 30, maxY = 170
  const range = 0.5 // 5.0 - 4.5
  const minVal = 4.0
  return months.map((label, i) => ({
    label,
    x: 65 + i * 55,
    y: maxY - ((mockRatings[i] - minVal) / range) * (maxY - minY)
  }))
})

const linePoints = computed(() => lineData.value.map(p => `${p.x},${p.y}`).join(' '))

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
