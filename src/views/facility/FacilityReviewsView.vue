<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { getReviews, replyToReview } from '@/services/reviewService'
import { useI18n } from 'vue-i18n'
import { useFormatDate } from '@/composables/useFormatDate'

const store = useStaffStore()
const { can } = useAuthPermissions()
const { t, locale } = useI18n()
const { formatDate } = useFormatDate()

const reviews = ref([])
const loading = ref(false)
const error = ref(null)

const searchQuery = ref('')
const ratingFilter = ref(0)
const replyFilter = ref('all')
const replyingTo = ref(null)
const replyText = ref('')
const submitting = ref(false)
const maxReplyLength = 5000

let searchTimeout = null

const totalReviews = computed(() => reviews.value.length)

const averageRating = computed(() => {
  if (!reviews.value.length) return '0.0'
  const sum = reviews.value.reduce((acc, r) => acc + (r.rating || 0), 0)
  return (sum / reviews.value.length).toFixed(1)
})

const pendingReplies = computed(() => reviews.value.filter(r => !r.is_replied).length)

const repliedCount = computed(() => reviews.value.filter(r => r.is_replied).length)

const replyCharCount = computed(() => replyText.value.length)

function parseDatetime(str) {
  if (!str) return null
  const d = new Date(str.replace(' ', 'T'))
  return isNaN(d.getTime()) ? null : d
}

function formatDateShort(dateStr) {
  const d = parseDatetime(dateStr)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(dateStr) {
  const d = parseDatetime(dateStr)
  if (!d) return '—'
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function timeAgo(dateStr) {
  const d = parseDatetime(dateStr)
  if (!d) return ''
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDateShort(dateStr)
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function ratingLabel(rating) {
  const labels = { 5: 'Excellent', 4: 'Good', 3: 'Average', 2: 'Below Average', 1: 'Poor' }
  return labels[rating] || ''
}

async function fetchReviews() {
  loading.value = true
  error.value = null
  try {
    const params = {}
    if (searchQuery.value.trim()) params.patient_name = searchQuery.value.trim()
    if (ratingFilter.value > 0) params.rating = ratingFilter.value
    if (replyFilter.value === 'replied') params.status = 'replied'
    else if (replyFilter.value === 'awaiting') params.status = 'waiting'

    const { data } = await getReviews(params)
    reviews.value = data.data || data || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load reviews'
    reviews.value = []
  } finally {
    loading.value = false
  }
}

function onSearchInput(e) {
  searchQuery.value = e.target.value
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchReviews, 400)
}

function onRatingChange(val) {
  ratingFilter.value = val
  fetchReviews()
}

function onStatusChange(val) {
  replyFilter.value = val
  fetchReviews()
}

function startReply(review) {
  replyingTo.value = review.uuid
  replyText.value = ''
}

function cancelReply() {
  replyingTo.value = null
  replyText.value = ''
}

async function submitReply(uuid) {
  if (!replyText.value.trim() || replyText.value.length > maxReplyLength) return

  submitting.value = true
  try {
    const { data } = await replyToReview(uuid, { reply: replyText.value.trim() })
    const review = reviews.value.find(r => r.uuid === uuid)
    if (review) {
      review.is_replied = true
      const replyData = data.data?.reply || data.reply
      review.reply = replyData || { reply: replyText.value.trim(), created_at: new Date().toISOString() }
    }
    store.showToast('Reply submitted successfully', 'success')
    replyingTo.value = null
    replyText.value = ''
  } catch (err) {
    store.showToast(err.response?.data?.message || 'Failed to submit reply', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchReviews)
</script>

<template>
  <div class="animate-fade-in space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reviews</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">View patient feedback and respond to reviews</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-brand-primary text-xl">reviews</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ totalReviews }}</p>
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Total Reviews</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-amber-500 text-xl">star</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ averageRating }}</p>
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Average Rating</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-amber-500 text-xl">pending</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ pendingReplies }}</p>
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Awaiting Reply</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ repliedCount }}</p>
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Replied</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input :value="searchQuery" type="text" placeholder="Search by patient name..."
            class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
            @input="onSearchInput" />
        </div>
        <select :value="ratingFilter"
          class="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition cursor-pointer min-w-[140px]"
          @change="onRatingChange(Number($event.target.value))">
          <option :value="0">All Ratings</option>
          <option :value="5">5 ★★★★★</option>
          <option :value="4">4 ★★★★</option>
          <option :value="3">3 ★★★</option>
          <option :value="2">2 ★★</option>
          <option :value="1">1 ★</option>
        </select>
        <select :value="replyFilter"
          class="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition cursor-pointer min-w-[160px]"
          @change="onStatusChange($event.target.value)">
          <option value="all">All Reviews</option>
          <option value="replied">Replied</option>
          <option value="awaiting">Awaiting Reply</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <template v-if="loading">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-4 animate-pulse">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-28 bg-slate-100 dark:bg-slate-700 rounded"></div>
              <div class="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded"></div>
            <div class="h-3 w-3/4 bg-slate-100 dark:bg-slate-700 rounded"></div>
          </div>
          <div class="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-900/30 p-8 text-center">
        <div class="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-2xl text-rose-400">error_outline</span>
        </div>
        <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">Failed to load reviews</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
        <button class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover transition cursor-pointer" @click="fetchReviews">
          <span class="material-symbols-outlined text-base">refresh</span>
          Try Again
        </button>
      </div>
    </template>

    <!-- Empty State -->
    <template v-else-if="reviews.length === 0">
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-12 text-center">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-3xl text-slate-400">reviews</span>
        </div>
        <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">No Reviews Found</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">There are currently no patient reviews matching your filters.</p>
      </div>
    </template>

    <!-- Reviews Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="r in reviews" :key="r.uuid" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
        <!-- Card Header -->
        <div class="p-5 pb-0">
          <div class="flex items-start gap-3">
            <div v-if="r.patient?.avatar" class="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-800">
              <img :src="r.patient.avatar" :alt="r.patient?.name || ''" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-10 h-10 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-800">
              <span class="text-sm font-bold text-brand-primary">{{ getInitials(r.patient?.name) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ r.patient?.name || 'Anonymous' }}</p>
                <span class="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="r.is_replied ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="r.is_replied ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                  {{ r.is_replied ? 'Replied' : 'Pending' }}
                </span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <div class="flex items-center gap-0.5">
                  <template v-for="s in 5" :key="s">
                    <svg class="w-3.5 h-3.5" :class="s <= r.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </template>
                </div>
                <span class="text-xs font-medium text-slate-400 dark:text-slate-500">{{ r.rating }}.0 · {{ ratingLabel(r.rating) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-1 flex flex-col">
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">{{ r.content }}</p>

          <!-- Meta -->
          <div class="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <span class="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <span class="material-symbols-outlined text-[14px]">schedule</span>
              {{ timeAgo(r.created_at) }}
            </span>
            <span v-if="r.appointment" class="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <span class="material-symbols-outlined text-[14px]">event</span>
              {{ formatDateShort(r.appointment.start_at) }}
            </span>
          </div>
        </div>

        <!-- Reply Section -->
        <div class="p-5 pt-0">
          <!-- Existing Reply -->
          <div v-if="r.is_replied && r.reply" class="bg-brand-primary/5 dark:bg-brand-primary/10 rounded-xl p-4 border border-brand-primary/10 space-y-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-brand-primary text-base">support_agent</span>
              <span class="text-xs font-bold text-brand-primary uppercase tracking-wider">Staff Reply</span>
            </div>
            <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ r.reply.reply }}</p>
            <p v-if="r.reply.created_at" class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">schedule</span>
              {{ formatDateShort(r.reply.created_at) }}
            </p>
          </div>

          <!-- Reply Form -->
          <div v-else-if="!r.is_replied">
            <template v-if="replyingTo === r.uuid">
              <div class="space-y-3">
                <div class="relative">
                  <textarea v-model="replyText"
                    class="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-primary/20 outline-none transition min-h-[80px] resize-none"
                    placeholder="Write your reply to this review..."
                    :maxlength="maxReplyLength"></textarea>
                  <span class="absolute bottom-2 right-3 text-[10px] text-slate-400 pointer-events-none">{{ replyCharCount }}/5000</span>
                </div>
                <div class="flex items-center gap-2 justify-end">
                  <button class="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer" @click="cancelReply">Cancel</button>
                  <button class="px-4 py-2 text-xs font-semibold bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary-hover hover:shadow-md transition-all inline-flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer" :disabled="!replyText.trim() || submitting || replyText.length > maxReplyLength" @click="submitReply(r.uuid)">
                    <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span class="material-symbols-outlined text-sm" v-else>send</span>
                    {{ submitting ? 'Sending...' : 'Send Reply' }}
                  </button>
                </div>
              </div>
            </template>
            <button v-else class="w-full flex items-center justify-center gap-1.5 border border-dashed border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-xl px-4 py-2.5 text-xs font-semibold hover:border-brand-primary/30 hover:text-brand-primary hover:bg-brand-primary/5 transition-all cursor-pointer" @click="startReply(r)">
              <span class="material-symbols-outlined text-base">reply</span>
              Reply to Review
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
