<script setup>
import { ref, computed } from 'vue';
import { useMessagesStore } from '../../../stores/messages';
import BaseTable from '../global/BaseTable.vue';
import BaseBadge from '../global/BaseBadge.vue';
import BaseSearch from '../global/BaseSearch.vue';
import BaseEmptyState from '../global/BaseEmptyState.vue';
import ConfirmModal from '../global/ConfirmModal.vue';
import MessageDetailDialog from './MessageDetailDialog.vue';

const store = useMessagesStore();

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'message', label: 'Message Preview' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'created_at', label: 'Created At', width: '180px' },
  { key: 'actions', label: 'Actions', align: 'right', width: '120px' }
];

const searchQuery = ref('');
const statusFilter = ref('all');

const filteredMessages = computed(() => {
  return store.messages.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         m.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'all' || m.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

const getStatusVariant = (status) => {
  switch (status) {
    case 'new': return 'info';
    case 'read': return 'warning';
    case 'replied': return 'success';
    default: return 'neutral';
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const truncate = (text, length = 50) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Actions
const selectedMessage = ref(null);
const showDetailDialog = ref(false);
const showDeleteConfirm = ref(false);

const viewMessage = (message) => {
  selectedMessage.value = message;
  showDetailDialog.value = true;
  store.markAsRead(message.id);
};

const confirmDelete = (message) => {
  selectedMessage.value = message;
  showDeleteConfirm.value = true;
};

const handleDelete = () => {
  if (selectedMessage.value) {
    store.deleteMessage(selectedMessage.value.id);
    showDeleteConfirm.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search by name or email..." />
      <select 
        v-model="statusFilter"
        class="min-w-[160px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition"
      >
        <option value="all">All Status</option>
        <option value="new">New</option>
        <option value="read">Read</option>
        <option value="replied">Replied</option>
      </select>
    </div>

    <BaseTable :columns="columns" :items="filteredMessages">
      <template #cell(message)="{ item }">
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ truncate(item.message) }}</span>
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
            @click="viewMessage(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition"
            title="View Details"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            @click="confirmDelete(item)"
            class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete Message"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>

      <template #empty>
        <BaseEmptyState 
          v-if="searchQuery || statusFilter !== 'all'"
          title="No messages found" 
          description="Try adjusting your search or filter criteria"
          @reset="searchQuery = ''; statusFilter = 'all'"
        />
        <BaseEmptyState 
          v-else
          icon="mail"
          title="Inbox is empty" 
          description="You don't have any contact messages yet"
        />
      </template>
    </BaseTable>

    <MessageDetailDialog 
      :show="showDetailDialog"
      :message="selectedMessage"
      @close="showDetailDialog = false"
      @replied="store.markAsReplied(selectedMessage?.id)"
    />

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="Delete Message"
      :message="`Are you sure you want to delete the message from <strong>${selectedMessage?.name}</strong>?`"
      @confirm="handleDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
