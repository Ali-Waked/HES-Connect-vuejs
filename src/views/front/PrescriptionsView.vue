<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">My Prescriptions</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">View your prescriptions and medications</p>
        </div>
      </div>

      <div v-if="loading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div class="flex-1 space-y-3">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48" />
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-red-400 mb-2">error_outline</span>
        <p class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
        <button class="mt-3 text-sm font-semibold text-brand-primary cursor-pointer" @click="fetchPrescriptions">Retry</button>
      </div>

      <div v-else-if="!prescriptions.length" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">prescriptions</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">No prescriptions found</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Your prescriptions will appear here once prescribed by a doctor.</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="p in prescriptions" :key="p.uuid"
          class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200">
          <div class="flex items-start gap-4">
            <img v-if="p.doctor?.avatar" :src="p.doctor.avatar" :alt="resolveTranslatedValue(p.doctor?.name, locale)" class="w-12 h-12 rounded-full object-cover shrink-0" />
            <div v-else class="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white font-bold text-sm">
              {{ getNameInitial(p.doctor?.name, locale) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ resolveTranslatedValue(p.doctor?.name, locale) || 'Doctor' }}</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ resolveTranslatedValue(p.facility?.name, locale) || '' }}</p>
                </div>
                <span class="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="statusClasses(p.status)">{{ p.status }}</span>
              </div>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span class="inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base">calendar_today</span>
                  {{ formatDate(p.created_at) }}
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base">medication</span>
                  {{ p.items_count ?? p.items?.length ?? 0 }} medicine(s)
                </span>
              </div>

              <div class="flex items-center gap-2 mt-2">
                <span class="text-[11px] font-mono text-slate-400 dark:text-slate-500">#{{ shortUuid(p.uuid) }}</span>
              </div>

              <div v-if="(p.items || p.medicines)?.length" class="mt-3 flex flex-wrap gap-2">
                <div v-for="(m, i) in (p.items || p.medicines).slice(0, 3)" :key="i"
                  class="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700 max-w-[180px]">
                  <img v-if="m.medicine?.image_url" :src="m.medicine.image_url" :alt="resolveTranslatedValue(m.medicine?.name, locale)" class="w-5 h-5 rounded object-cover shrink-0" />
                  <span v-else class="w-5 h-5 rounded bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[10px] text-brand-primary">medication</span>
                  </span>
                  <span class="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">{{ resolveTranslatedValue(m.medicine?.name || m.name || m.medicine_name, locale) }}</span>
                </div>
                <span v-if="(p.items || p.medicines).length > 3" class="text-[11px] text-slate-400 dark:text-slate-500 self-center">+{{ (p.items || p.medicines).length - 3 }} more</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button class="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="$router.push('/prescriptions/' + p.uuid)">
              <span class="material-symbols-outlined text-base">visibility</span>
              View Details
            </button>
          </div>
        </div>
      </div>

      <div v-if="pagination.total > 0" class="flex items-center justify-center gap-2 mt-8">
        <button :disabled="pagination.current_page <= 1"
          class="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          @click="setPage(pagination.current_page - 1)">Prev</button>
        <div class="flex items-center gap-1">
          <button v-for="p in visiblePages" :key="p"
            class="w-9 h-9 rounded-lg text-sm font-semibold transition cursor-pointer"
            :class="p === pagination.current_page ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'"
            @click="setPage(p)">{{ p }}</button>
        </div>
        <button :disabled="pagination.current_page >= pagination.last_page"
          class="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          @click="setPage(pagination.current_page + 1)">Next</button>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import { getPatientPrescriptions } from '@/services/patientPrescriptionService'
import { resolveTranslatedValue, getNameInitial } from '../../utils/locale'

const { locale } = useI18n()

const prescriptions = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0 })

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function shortUuid(uuid) {
  return uuid ? uuid.slice(0, 8) + '...' : '—'
}

function statusClasses(status) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'completed': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }
}

const visiblePages = computed(() => {
  const total = pagination.value.last_page
  const current = pagination.value.current_page
  const pages = []
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function setPage(page) {
  pagination.value.current_page = page
  fetchPrescriptions()
}

async function fetchPrescriptions() {
  loading.value = true
  error.value = null
  try {
    const { data } = await getPatientPrescriptions({ page: pagination.value.current_page })
    prescriptions.value = data.data || []
    if (data.meta) {
      pagination.value = {
        current_page: data.meta.current_page || 1,
        last_page: data.meta.last_page || 1,
        per_page: data.meta.per_page || 10,
        total: data.meta.total || 0,
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load prescriptions'
    prescriptions.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchPrescriptions)
</script>
