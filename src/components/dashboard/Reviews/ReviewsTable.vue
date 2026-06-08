<script setup>
import { ref, computed } from 'vue';
import { useReviewsStore } from '../../../stores/reviews';
import BaseTable from '../global/BaseTable.vue';
import BaseBadge from '../global/BaseBadge.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import RatingStars from '../global/RatingStars.vue';
import ReviewDetailDialog from './ReviewDetailDialog.vue';

const store = useReviewsStore();

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'user', label: 'User' },
  { key: 'rating', label: 'Rating', width: '120px' },
  { key: 'comment', label: 'Comment' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'created_at', label: 'Created At', width: '180px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '120px' }
];

const searchQuery = ref('');
const statusFilter = ref('all');
const ratingFilter = ref('all');

const filteredReviews = computed(() => {
  return store.reviews.filter(r => {
    const matchesSearch = r.user.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         r.comment.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'all' || r.status === statusFilter.value;
    const matchesRating = ratingFilter.value === 'all' || r.rating === parseInt(ratingFilter.value);
    return matchesSearch && matchesStatus && matchesRating;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const getStatusVariant = (status) => {
  switch (status) {
    case 'approved': return 'success';
    case 'hidden': return 'danger';
    case 'pending': return 'warning';
    default: return 'neutral';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const truncate = (text, length = 60) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Actions
const selectedReview = ref(null);
const showDetailDialog = ref(false);
const showDeleteConfirm = ref(false);

const viewReview = (review) => {
  selectedReview.value = review;
  showDetailDialog.value = true;
};

const confirmDelete = (review) => {
  selectedReview.value = review;
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  if (selectedReview.value) {
    store.deleteReview(selectedReview.value.id);
    showDeleteConfirm.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col lg:flex-row gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search reviews..." />
      <div class="flex gap-3">
        <select 
          v-model="statusFilter"
          class="min-w-[140px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
          <option value="pending">Pending</option>
        </select>
        <select 
          v-model="ratingFilter"
          class="min-w-[140px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>
    </div>

    <BaseTable :columns="columns" :items="filteredReviews">
      <template #cell(rating)="{ item }">
        <RatingStars :rating="item.rating" />
      </template>

      <template #cell(comment)="{ item }">
        <span class="text-sm text-slate-500 dark:text-slate-400 italic">"{{ truncate(item.comment) }}"</span>
      </template>
      
      <template #cell(status)="{ item }">
        <BaseBadge :variant="getStatusVariant(item.status)">
          {{ item.status }}
        </BaseBadge>
      </template>

      <template #cell(created_at)="{ item }">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(item.created_at) }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end gap-1">
          <button 
            @click="viewReview(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition"
            title="View Details"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            v-if="item.status !== 'approved'"
            @click="store.approveReview(item.id)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            title="Approve Review"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button 
            v-if="item.status !== 'hidden'"
            @click="store.hideReview(item.id)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
            title="Hide Review"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          </button>
          <button 
            @click="confirmDelete(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete Review"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>

      <template #empty>
        <BaseEmptyState 
          v-if="searchQuery || statusFilter !== 'all' || ratingFilter !== 'all'"
          title="No reviews found" 
          description="Try adjusting your filters"
          @reset="searchQuery = ''; statusFilter = 'all'; ratingFilter = 'all'"
        />
        <BaseEmptyState 
          v-else
          icon="star"
          title="No reviews yet" 
          description="Platform reviews will appear here"
        />
      </template>
    </BaseTable>

    <ReviewDetailDialog 
      :show="showDetailDialog"
      :review="selectedReview"
      @close="showDetailDialog = false"
    />

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="Delete Review"
      :message="`Are you sure you want to delete the review from <strong>${selectedReview?.user}</strong>?`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
