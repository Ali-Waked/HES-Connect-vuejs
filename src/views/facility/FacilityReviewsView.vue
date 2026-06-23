<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import { useAuthPermissions } from '@/composables/useAuthPermissions'
import { getReviews, replyToReview } from '@/services/reviewService'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'
import StatsCard from '@/components/staff/shared/StatsCard.vue'

const store = useStaffStore()
const { can } = useAuthPermissions()

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

const replyCharCount = computed(() => replyText.value.length)

function parseDatetime(str) {
  if (!str) return null
  const d = new Date(str.replace(' ', 'T'))
  return isNaN(d.getTime()) ? null : d
}

function formatDate(dateStr) {
  const d = parseDatetime(dateStr)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(dateStr) {
  const d = parseDatetime(dateStr)
  if (!d) return '—'
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function stars(rating) {
  const r = Math.round(rating || 0)
  return '★'.repeat(r) + '☆'.repeat(5 - r)
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
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reviews</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">View patient feedback and respond to reviews</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatsCard icon="star" :value="totalReviews" label="Total Reviews" tone="brand" />
      <StatsCard icon="stars" :value="averageRating" label="Average Rating" tone="amber" />
      <StatsCard icon="forum" :value="pendingReplies" label="Reviews Awaiting Reply" tone="blue" />
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="relative lg:col-span-2">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input :value="searchQuery" type="text" placeholder="Search by patient name..."
            class="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"
            @input="onSearchInput" />
        </div>
        <select :value="ratingFilter"
          class="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer"
          @change="onRatingChange(Number($event.target.value))">
          <option :value="0">All Ratings</option>
          <option :value="5">★★★★★</option>
          <option :value="4">★★★★☆</option>
          <option :value="3">★★★☆☆</option>
          <option :value="2">★★☆☆☆</option>
          <option :value="1">★☆☆☆☆</option>
        </select>
        <select :value="replyFilter"
          class="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-2.5 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition cursor-pointer"
          @change="onStatusChange($event.target.value)">
          <option value="all">All Reviews</option>
          <option value="replied">Replied</option>
          <option value="awaiting">Awaiting Reply</option>
        </select>
      </div>
    </div>

    <template v-if="loading">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 animate-pulse">
          <div class="flex items-start gap-3">
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
          <div class="h-20 bg-slate-100 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    </template>

    <template v-else-if="error">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/30 p-8 text-center">
        <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-3xl text-red-400">error_outline</span>
        </div>
        <p class="text-lg font-bold text-slate-900 dark:text-white mb-1">Failed to load reviews</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ error }}</p>
        <button class="btn-primary" @click="fetchReviews">
          <span class="material-symbols-outlined text-base">refresh</span>
          Try Again
        </button>
      </div>
    </template>

    <template v-else-if="reviews.length === 0">
      <div class="empty-state">
        <div class="empty-state-icon">
          <span class="material-symbols-outlined empty-state-icon-svg">reviews</span>
        </div>
        <p class="text-lg font-bold text-slate-900 dark:text-white">No Reviews Found</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">There are currently no patient reviews matching your filters.</p>
      </div>
    </template>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="r in reviews" :key="r.uuid" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow duration-200">
        <div class="flex items-start gap-3">
          <AvatarInitial :name="r.patient?.name || 'A'" size="md" />
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ r.patient?.name || 'Anonymous' }}</p>
              <span class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                :class="r.is_replied ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'">
                {{ r.is_replied ? 'Replied' : 'Awaiting Reply' }}
              </span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-amber-400 text-sm tracking-wider">{{ stars(r.rating) }}</span>
              <span class="text-xs text-slate-400 dark:text-slate-500">{{ r.rating }}.0</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
          <span class="inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">calendar_today</span>
            {{ formatDate(r.created_at) }}
          </span>
          <span v-if="r.appointment" class="inline-flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">event</span>
            {{ formatDate(r.appointment.start_at) }}
            {{ formatTime(r.appointment.start_at) }} - {{ formatTime(r.appointment.end_at) }}
          </span>
        </div>

        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ r.content }}</p>

        <div v-if="r.is_replied && r.reply" class="bg-brand-primary/5 dark:bg-brand-primary/10 rounded-xl p-4 border border-brand-primary/10 space-y-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-brand-primary text-base">support_agent</span>
            <span class="text-xs font-bold text-brand-primary uppercase tracking-wider">Staff Reply</span>
          </div>
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ r.reply.reply }}</p>
          <p v-if="r.reply.created_at" class="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">schedule</span>
            {{ formatDate(r.reply.created_at) }}
          </p>
        </div>

        <div v-else-if="can('reviews.manage') && !r.is_replied">
          <template v-if="replyingTo === r.uuid">
            <div class="space-y-3">
              <div class="relative">
                <textarea v-model="replyText"
                  class="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-primary/20 outline-none transition min-h-[100px] resize-none"
                  placeholder="Write your reply to this review..."
                  :maxlength="maxReplyLength"></textarea>
                <span class="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none">{{ replyCharCount }}/5000</span>
              </div>
              <div class="flex items-center gap-2 justify-end">
                <button class="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer" @click="cancelReply">Cancel</button>
                <button class="px-5 py-2.5 text-sm font-semibold bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary-hover hover:shadow-md transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer" :disabled="!replyText.trim() || submitting || replyText.length > maxReplyLength" @click="submitReply(r.uuid)">
                  <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span v-else>Submit Reply</span>
                </button>
              </div>
            </div>
          </template>
          <button v-else class="w-full flex items-center justify-center gap-1.5 border border-brand-primary/20 text-brand-primary rounded-lg px-5 py-2 text-sm font-semibold hover:bg-brand-primary/5 transition-all cursor-pointer" @click="startReply(r)">
            <span class="material-symbols-outlined text-base">reply</span>
            Reply to Review
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
