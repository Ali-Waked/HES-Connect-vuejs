<script setup>
import { ref, computed } from 'vue';
import BaseTable from '../../components/dashboard/global/BaseTable.vue';
import BaseSearch from '../../components/dashboard/global/BaseSearch.vue';
import BaseBadge from '../../components/dashboard/global/BaseBadge.vue';
import BaseDialog from '../../components/dashboard/global/BaseDialog.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const conversations = ref([
  { id: 1, participants: ['Dr. Ahmed Hassan', 'Khalid Abu Amr'], last_message: 'Your lab results are ready for review.', created_at: '2026-06-07T10:00:00Z', status: 'Active' },
  { id: 2, participants: ['Dr. Fatima Al-Zahroa', 'Layla Ibrahim'], last_message: 'Please follow the dosage instructions carefully.', created_at: '2026-06-06T15:30:00Z', status: 'Active' },
  { id: 3, participants: ['Dr. Omar Khalil', 'Amir Zaki'], last_message: 'The surgery is scheduled for tomorrow morning.', created_at: '2026-06-05T09:15:00Z', status: 'Closed' }
]);

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'participants', label: 'Participants' },
  { key: 'last_message', label: 'Last Message' },
  { key: 'created_at', label: 'Started At', width: '180px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'actions', label: 'Oversight', align: 'right', width: '100px' }
];

const searchQuery = ref('');
const selectedConv = ref(null);
const showOversightModal = ref(false);

const filteredConversations = computed(() => {
  return conversations.value.filter(c => {
    return c.participants.some(p => p.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
           c.last_message.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

const viewOversight = (conv) => {
  selectedConv.value = conv;
  showOversightModal.value = true;
};
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('pageTitles.conversations') }}</h1>
        <p class="text-sm text-slate-500 mt-1 font-medium">{{ t('pageTitles.conversationsDesc') }}</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex flex-col lg:flex-row gap-4">
      <BaseSearch v-model="searchQuery" placeholder="Search by participant or message content..." />
    </div>

    <!-- Table -->
    <BaseTable :columns="columns" :items="filteredConversations">
      <template #cell(participants)="{ item }">
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-900 dark:text-white">{{ item.participants.join(' & ') }}</span>
        </div>
      </template>

      <template #cell(last_message)="{ item }">
        <p class="text-sm text-slate-500 dark:text-slate-400 italic line-clamp-1">"{{ item.last_message }}"</p>
      </template>

      <template #cell(status)="{ item }">
        <BaseBadge :variant="item.status === 'Active' ? 'success' : 'neutral'">{{ item.status }}</BaseBadge>
      </template>

      <template #cell(created_at)="{ item }">
        <span class="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">{{ new Date(item.created_at).toLocaleString() }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <button 
          @click="viewOversight(item)"
          class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </button>
      </template>
    </BaseTable>

    <!-- Oversight Modal -->
    <BaseDialog :show="showOversightModal" title="Conversation Oversight" size="lg" @close="showOversightModal = false">
      <div v-if="selectedConv" class="space-y-6">
        <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div class="flex -space-x-4">
            <div class="w-12 h-12 rounded-full bg-blue-500 border-4 border-white dark:border-slate-800 flex items-center justify-center text-white font-bold">D</div>
            <div class="w-12 h-12 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-800 flex items-center justify-center text-white font-bold">P</div>
          </div>
          <div>
            <h4 class="text-base font-bold text-slate-900 dark:text-white">{{ selectedConv.participants.join(' vs ') }}</h4>
            <p class="text-xs text-slate-500">Session ID: CONV-{{ selectedConv.id }}</p>
          </div>
        </div>

        <!-- Chat Log Simulation -->
        <div class="space-y-4 max-h-[400px] overflow-y-auto p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl custom-scrollbar">
          <div class="flex flex-col gap-1 max-w-[80%]">
            <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Dr. Ahmed Hassan</span>
            <div class="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none text-sm text-slate-700 dark:text-slate-300">
              Your lab results are ready for review. Please check them in your dashboard.
            </div>
            <span class="text-[9px] text-slate-400 dark:text-slate-500 self-end">10:00 AM</span>
          </div>

          <div class="flex flex-col gap-1 max-w-[80%] self-end items-end">
            <span class="text-[10px] font-black text-brand-primary uppercase tracking-widest px-1 text-right">Khalid Abu Amr</span>
            <div class="p-3 bg-brand-primary text-white rounded-2xl rounded-tr-none text-sm shadow-md shadow-brand-primary/15">
              Thank you doctor. I will review them now. Is there anything concerning?
            </div>
            <span class="text-[9px] text-slate-400 dark:text-slate-500 self-start">10:02 AM</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button class="flex-grow py-3 bg-rose-50/30 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-100/50 dark:hover:bg-rose-900/40 transition">Flag Conversation</button>
          <button class="flex-grow py-3 bg-slate-900 dark:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition">End Session</button>
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
</style>
