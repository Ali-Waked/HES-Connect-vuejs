<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">My Appointments</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage your appointments</p>
        </div>
        <button class="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition cursor-pointer" @click="$router.push('/doctors')">
          <span class="material-symbols-outlined text-lg">add</span>
          Book New Appointment
        </button>
      </div>

      <!-- Status Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto">
        <button
          v-for="(tab, i) in tabs"
          :key="i"
          class="rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition cursor-pointer"
          :class="(statusFilter || 'all') === tab.key ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
          @click="setStatusFilter(tab.key === 'all' ? '' : tab.key)"
        >{{ tab.label }}</button>
      </div>

      <!-- Loading -->
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

      <!-- Error -->
      <div v-else-if="error" class="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-red-400 mb-2">error_outline</span>
        <p class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
        <button class="mt-3 text-sm font-semibold text-brand-primary cursor-pointer" @click="fetchAppointments">Retry</button>
      </div>

      <!-- Empty -->
      <div v-else-if="!appointments.length" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">calendar_month</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">No appointments found</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">You don't have any appointments matching this criteria.</p>
      </div>

      <!-- Appointments List -->
      <div v-else class="space-y-3">
        <div
          v-for="appt in appointments"
          :key="appt.id"
          class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200"
        >
          <div class="flex items-start gap-4">
            <!-- Doctor Avatar -->
            <div class="w-12 h-12 rounded-full shrink-0 flex items-center justify-center overflow-hidden">
              <img
                v-if="doctorAvatar(appt)"
                :src="doctorAvatar(appt)"
                :alt="doctorName(appt)"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-white font-bold text-sm"
              >
                {{ doctorInitial(appt) }}
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ doctorName(appt) }}</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ facilityName(appt) }}</p>
                </div>
                <span
                  class="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="statusClasses(appt.status?.value)"
                >{{ appt.status?.label || appt.status?.value }}</span>
              </div>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span class="inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base">calendar_today</span>
                  {{ relativeDate(appt.schedule?.date || appt.schedule?.start_at) }}
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base">schedule</span>
                  {{ formatTime(appt.schedule?.start_at) }} – {{ formatTime(appt.schedule?.end_at) }}
                </span>
              </div>

              <p v-if="appt.reason" class="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">"{{ appt.reason }}"</p>

              <!-- Review -->
              <div v-if="appt.review" class="flex items-center gap-2 mt-2">
                <div class="flex items-center">
                  <svg v-for="s in 5" :key="s" class="w-4 h-4" :class="s <= appt.review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                </div>
                <span v-if="appt.review.comment" class="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[200px]">— {{ appt.review.comment }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button class="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer" @click="openDrawer(appt)">
              <span class="material-symbols-outlined text-base">visibility</span>
              Details
            </button>
            <button
              v-if="canCancel(appt)"
              class="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
              @click="handleCancel(appt)"
            >
              <span class="material-symbols-outlined text-base">cancel</span>
              Cancel
            </button>
            <button
              v-if="appt.status?.value === 'completed' && !appt.review"
              class="inline-flex items-center gap-1 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-primary-dark transition cursor-pointer"
              @click="openReview(appt)"
            >
              <span class="material-symbols-outlined text-base">star</span>
              Leave Review
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="flex items-center justify-center gap-2 mt-8">
        <button
          :disabled="pagination.current_page <= 1"
          class="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          @click="setPage(pagination.current_page - 1)"
        >Prev</button>
        <div class="flex items-center gap-1">
          <button
            v-for="p in visiblePages"
            :key="p"
            class="w-9 h-9 rounded-lg text-sm font-semibold transition cursor-pointer"
            :class="p === pagination.current_page ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'"
            @click="setPage(p)"
          >{{ p }}</button>
        </div>
        <button
          :disabled="pagination.current_page >= pagination.last_page"
          class="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          @click="setPage(pagination.current_page + 1)"
        >Next</button>
      </div>
    </main>

    <LandingFooter />

    <!-- Detail Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawerOpen && drawerAppt" class="fixed inset-0 z-50 flex justify-end">
          <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" @click="closeDrawer" />
          <div class="relative w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700 h-full overflow-y-auto">
            <div class="sticky top-0 bg-white dark:bg-slate-800 z-10 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Appointment Details</h3>
              <button class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer" @click="closeDrawer">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div class="p-6 space-y-5">
              <!-- Doctor -->
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full shrink-0 overflow-hidden">
                  <img
                    v-if="doctorAvatar(drawerAppt)"
                    :src="doctorAvatar(drawerAppt)"
                    :alt="doctorName(drawerAppt)"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-white font-bold text-sm"
                  >
                    {{ doctorInitial(drawerAppt) }}
                  </div>
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ doctorName(drawerAppt) }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ facilityName(drawerAppt) }}</p>
                </div>
              </div>

              <!-- Status -->
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-500 dark:text-slate-400">Status:</span>
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" :class="statusClasses(drawerAppt.status?.value)">{{ drawerAppt.status?.label || drawerAppt.status?.value }}</span>
              </div>

              <!-- Schedule -->
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm">
                  <span class="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                  <span class="text-slate-700 dark:text-slate-300">{{ formatDate(drawerAppt.schedule?.date || drawerAppt.schedule?.start_at) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="material-symbols-outlined text-base text-slate-400">schedule</span>
                  <span class="text-slate-700 dark:text-slate-300">{{ formatTime(drawerAppt.schedule?.start_at) }} – {{ formatTime(drawerAppt.schedule?.end_at) }}</span>
                </div>
              </div>

              <!-- Reason -->
              <div v-if="drawerAppt.reason">
                <h4 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Reason</h4>
                <p class="text-sm text-slate-700 dark:text-slate-300">{{ drawerAppt.reason }}</p>
              </div>

              <!-- Notes -->
              <div v-if="drawerAppt.notes">
                <h4 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Notes</h4>
                <p class="text-sm text-slate-700 dark:text-slate-300">{{ drawerAppt.notes }}</p>
              </div>

              <!-- Cancellation Reason -->
              <div v-if="drawerAppt.cancellation_reason">
                <h4 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Cancellation Reason</h4>
                <p class="text-sm text-red-500">{{ drawerAppt.cancellation_reason }}</p>
              </div>

              <!-- Review -->
              <div v-if="drawerAppt.review">
                <h4 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Your Review</h4>
                <div class="flex items-center gap-1 mb-1">
                  <svg v-for="s in 5" :key="s" class="w-5 h-5" :class="s <= drawerAppt.review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                </div>
                <p v-if="drawerAppt.review.comment" class="text-sm text-slate-600 dark:text-slate-400">{{ drawerAppt.review.comment }}</p>
                <p class="text-xs text-slate-400 mt-1">{{ formatDate(drawerAppt.review.created_at) }}</p>
              </div>

              <!-- Created -->
              <div class="text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                Booked on {{ formatDate(drawerAppt.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ReviewModal :show="reviewModal" :appointment-id="reviewAppointmentId" @close="reviewModal = false" @reviewed="onReviewed" />

    <ConfirmModal
      :show="cancelModal"
      title="Cancel Appointment"
      message="Are you sure you want to cancel this appointment? This action cannot be undone."
      confirm-text="Yes, Cancel"
      @confirm="confirmCancel"
      @close="cancelModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import ReviewModal from '@/components/public/ReviewModal.vue'
import ConfirmModal from '@/components/dashboard/global/ConfirmModal.vue'
import { usePatientAppointments } from '@/composables/usePatientAppointments'
import { useWorkspaceStore } from '@/stores/workspace'

const workspaceStore = useWorkspaceStore()
const {
  appointments, loading, error, statusFilter, pagination,
  fetchAppointments, cancelAppointment, setPage, setStatusFilter,
} = usePatientAppointments()

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

const visiblePages = computed(() => {
  const total = pagination.last_page
  const current = pagination.current_page
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

const drawerOpen = ref(false)
const drawerAppt = ref(null)
const reviewModal = ref(false)
const reviewAppointmentId = ref(null)
const cancelModal = ref(false)
const cancelAppt = ref(null)

function doctorName(appt) {
  return appt.doctor?.name || appt.doctor_name || 'Doctor'
}

function doctorInitial(appt) {
  const name = doctorName(appt)
  return name.charAt(0).toUpperCase()
}

function doctorAvatar(appt) {
  return appt.doctor?.avatar || appt.doctor?.profile_image || appt.doctor?.image || null
}

function facilityName(appt) {
  return appt.facility?.name || appt.facility_name || ''
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function relativeDate(dateStr) {
  if (!dateStr) return '—'
  const today = new Date()
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  const diff = Math.round((d - new Date(today.toISOString().slice(0, 10) + 'T00:00:00')) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function statusClasses(status) {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'confirmed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'checked_in': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'in_progress': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'completed': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'no_show': return 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
    case 'rescheduled': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
  }
}

function canCancel(appt) {
  const active = ['scheduled', 'confirmed', 'checked_in', 'in_progress']
  return active.includes(appt.status?.value)
}

function openDrawer(appt) {
  drawerAppt.value = appt
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  drawerAppt.value = null
}

async function handleCancel(appt) {
  cancelAppt.value = appt
  cancelModal.value = true
}

async function confirmCancel() {
  if (!cancelAppt.value) return
  try {
    await cancelAppointment(cancelAppt.value.id)
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to cancel appointment')
  } finally {
    cancelModal.value = false
    cancelAppt.value = null
  }
}

function openReview(appt) {
  reviewAppointmentId.value = appt.id
  reviewModal.value = true
}

function onReviewed() {
  const appt = appointments.value.find(a => a.id === reviewAppointmentId.value)
  if (appt) appt.review = { rating: true }
  reviewAppointmentId.value = null
  fetchAppointments()
}

onMounted(fetchAppointments)

watch(() => workspaceStore.currentWorkspaceId, () => {
  fetchAppointments()
})
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.25s ease;
}
.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(100%);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
