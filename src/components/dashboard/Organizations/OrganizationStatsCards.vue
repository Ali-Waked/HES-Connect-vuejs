<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOrganizationStats } from '../../../services/organizationService'

const props = defineProps({
  stats: { type: Object, default: null }
})

const emit = defineEmits(['loaded'])

const localStats = ref(null)
const loading = ref(!props.stats)
const error = ref(null)

const data = computed(() => props.stats || localStats.value)

const cards = computed(() => [
  {
    title: 'Total Organizations',
    value: data.value?.total_organizations ?? '—',
    icon: 'corporate_fare',
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Total Users',
    value: data.value?.total_users ?? '—',
    icon: 'group',
    color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Total Facilities',
    value: data.value?.total_facilities ?? '—',
    icon: 'home_health',
    color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Active Organizations',
    value: data.value?.total_organizations ?? '—',
    icon: 'category',
    color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  },
])

async function fetchStats() {
  if (props.stats) return
  loading.value = true
  error.value = null
  try {
    const { data: res } = await getOrganizationStats()
    localStats.value = res
    emit('loaded', res)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load stats'
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)
</script>

<template>
  <div>
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse"
      >
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div class="flex-1 space-y-2">
            <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div class="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800"
    >
      <span class="material-symbols-outlined text-rose-500 text-xl">error_outline</span>
      <p class="text-sm font-semibold text-rose-600 dark:text-rose-400">{{ error }}</p>
    </div>

    <div v-else-if="cards.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in cards"
        :key="card.title"
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 transition hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700"
      >
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          :class="card.color"
        >
          <span class="material-symbols-outlined text-2xl">{{ card.icon }}</span>
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {{ card.title }}
          </p>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ card.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
