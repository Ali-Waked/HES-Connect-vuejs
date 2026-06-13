<template>
  <div class="animate-fade-in space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatsCard icon="group" :value="store.facilityStaff.length" label="Total Staff" tone="brand" />
      <StatsCard icon="domain" :value="store.departments.length" label="Departments" tone="blue" />
      <StatsCard icon="calendar_month" :value="todayAppts.length" label="Today's Appointments" tone="slate" />
      <StatsCard icon="description" :value="pendingDocs" label="Pending Documents" tone="amber" />
      <StatsCard icon="work" :value="openJobs" label="Open Job Posts" tone="blue" />
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-48 w-full animate-pulse rounded-xl bg-slate-100"></div>
      <div class="h-48 w-full animate-pulse rounded-xl bg-slate-100"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Appointments This Week</h3>
            <p class="text-sm text-slate-500">Count by day (Sun–Sat)</p>
          </div>
          <div class="mt-6">
            <svg viewBox="0 0 350 180" class="w-full">
              <text x="10" y="20" font-size="11" fill="#94a3b8">{{ maxCount }}</text>
              <text x="10" y="60" font-size="11" fill="#94a3b8">{{ Math.round(maxCount/2) }}</text>
              <text x="10" y="100" font-size="11" fill="#94a3b8">0</text>
              <line x1="40" y1="15" x2="40" y2="105" stroke="#e2e8f0" stroke-width="1" />
              <line x1="40" y1="105" x2="340" y2="105" stroke="#e2e8f0" stroke-width="1" />
              <g v-for="(d, i) in weekData" :key="i">
                <rect :x="55 + i * 42" y="105" width="28" :height="barHeight(d)" :rx="4" :fill="d.isToday ? '#027a75' : '#cbd5e1'" />
                <text :x="55 + i * 42 + 14" y="125" font-size="10" text-anchor="middle" fill="#64748b">{{ d.label }}</text>
                <text :x="55 + i * 42 + 14" y="115 - barHeight(d) - 4" font-size="10" text-anchor="middle" fill="#334155">{{ d.count }}</text>
              </g>
            </svg>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900">Department Summary</h3>
              <p class="text-sm text-slate-500">Quick overview</p>
            </div>
          </div>
          <div class="mt-4 space-y-3">
            <div v-for="dept in store.departments" :key="dept.id" class="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div>
                <p class="font-semibold text-slate-900">{{ dept.name }}</p>
                <p class="text-xs text-slate-500">{{ dept.headDoctor }}</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{{ dept.staffCount }} staff</span>
                <button class="text-sm font-semibold text-brand-primary" @click="$router.push('/staff/departments')">Manage</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Pending Documents</h3>
            <p class="text-sm text-slate-500">Documents awaiting review</p>
          </div>
        </div>
        <div class="mt-4">
          <div v-if="pendingDocsList.length" class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Document Type</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Upload Date</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500">Status</th>
                  <th class="px-4 py-3 text-xs font-bold uppercase text-slate-500"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="doc in pendingDocsList" :key="doc.id" class="transition hover:bg-slate-50/70/70">
                  <td class="px-4 py-3 font-semibold text-slate-900">{{ doc.documentType }}</td>
                  <td class="px-4 py-3 text-sm text-slate-500">{{ doc.uploadDate }}</td>
                  <td class="px-4 py-3"><StatusBadge :status="doc.status" /></td>
                  <td class="px-4 py-3"><button class="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700">Review</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-8 text-center text-sm text-slate-500">No pending documents.</div>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Recent Job Posts</h3>
            <p class="text-sm text-slate-500">Latest openings</p>
          </div>
          <button class="rounded-md bg-brand-primary px-4 py-2 text-sm text-white" @click="$router.push('/staff/job-posts')">Post New Job</button>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="post in recentJobs" :key="post.id" class="rounded-lg border border-slate-100 p-4">
            <p class="font-bold text-slate-900">{{ post.title }}</p>
            <p class="mt-1 text-xs text-slate-500">Ends: {{ post.endDate }}</p>
            <div class="mt-2 flex items-center gap-2">
              <StatusBadge :status="post.status" />
              <span class="material-symbols-outlined text-[18px] text-slate-400">{{ post.applyMethod === 'email' ? 'mail' : 'link' }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import StatsCard from '@/components/staff/shared/StatsCard.vue'
import StatusBadge from '@/components/staff/shared/StatusBadge.vue'

const store = useStaffStore()
const loading = ref(true)

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const todayIdx = new Date().getDay()

const weekData = computed(() => dayNames.map((label, i) => {
  const count = store.appointments.filter(a => {
    const d = new Date(a.date)
    return d.getDay() === i
  }).length
  return { label, count, isToday: i === todayIdx }
}))

const maxCount = computed(() => Math.max(1, ...weekData.value.map(d => d.count)))
const barHeight = (d) => Math.max(4, (d.count / maxCount.value) * 80)

const todayAppts = computed(() => store.todayAppointments)
const pendingDocs = computed(() => store.documents.filter(d => d.status === 'pending').length)
const openJobs = computed(() => store.jobPosts.filter(j => j.status === 'approved').length)
const pendingDocsList = computed(() => store.documents.filter(d => d.status === 'pending').slice(0, 5))
const recentJobs = computed(() => [...store.jobPosts].slice(0, 3))

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
