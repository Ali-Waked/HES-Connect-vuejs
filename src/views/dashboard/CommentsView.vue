<script setup>
import { ref, computed } from 'vue';
import { useCommentsStore } from '../../stores/comments';
import StatisticsCard from '../../components/dashboard/global/StatisticsCard.vue';
import BaseTable from '../../components/dashboard/global/BaseTable.vue';
import BaseBadge from '../../components/dashboard/global/BaseBadge.vue';
import BaseSearch from '../../components/dashboard/global/BaseSearch.vue';
import BaseEmptyState from '../../components/dashboard/global/BaseEmptyState.vue';
import ConfirmModal from '../../components/dashboard/global/ConfirmModal.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useCommentsStore();

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'user', label: 'User' },
  { key: 'article', label: 'Article' },
  { key: 'content', label: 'Comment' },
  { key: 'date', label: 'Posted At', width: '180px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '150px' }
];

const searchQuery = ref('');
const showDeleteConfirm = ref(false);
const selectedComment = ref(null);

const filteredComments = computed(() => {
  return store.comments.filter(c => {
    return c.user.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
           c.content.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const getStatusVariant = (status) => {
  switch (status) {
    case 'Approved': return 'success';
    case 'Flagged': return 'danger';
    case 'Pending': return 'warning';
    default: return 'neutral';
  }
};

const confirmDelete = (comment) => {
  selectedComment.value = comment;
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  if (selectedComment.value) {
    store.deleteComment(selectedComment.value.id);
    showDeleteConfirm.value = false;
  }
};
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('pageTitles.contentModeration') }}</h1>
        <p class="text-sm text-slate-500 mt-1 font-medium">{{ t('pageTitles.contentModerationDesc') }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatisticsCard title="Total Comments" :value="store.stats.total" icon="chat_bubble" color="primary" />
      <StatisticsCard title="Pending Review" :value="store.stats.pending" icon="pending_actions" color="warning" />
      <StatisticsCard title="Flagged Content" :value="store.stats.flagged" icon="report" color="danger" />
    </div>

    <!-- Controls -->
    <div class="flex flex-col lg:flex-row gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search comments..." />
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :items="filteredComments">
      <template #cell(user)="{ item }">
        <span class="text-sm font-bold text-slate-900 dark:text-white">{{ item.user }}</span>
      </template>

      <template #cell(article)="{ item }">
        <span class="text-xs font-bold text-brand-primary truncate max-w-[150px] block">{{ item.article }}</span>
      </template>

      <template #cell(content)="{ item }">
        <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">"{{ item.content }}"</p>
      </template>

      <template #cell(status)="{ item }">
        <BaseBadge :variant="getStatusVariant(item.status)">{{ item.status }}</BaseBadge>
      </template>

      <template #cell(actions)="{ item }">
        <div class="flex justify-end gap-1">
          <button 
            v-if="item.status !== 'Approved'"
            @click="store.updateStatus(item.id, 'Approved')"
            class="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 rounded-lg transition"
            title="Approve"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          </button>
          <button 
            @click="confirmDelete(item)"
            class="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50/30 dark:hover:bg-rose-900/20 rounded-lg transition"
            title="Delete"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </template>

      <template #empty>
        <BaseEmptyState icon="forum" title="No comments" description="No user discussions found" />
      </template>
    </BaseTable>

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="Delete Comment"
      message="Are you sure you want to permanently remove this user comment? This action is irreversible."
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
