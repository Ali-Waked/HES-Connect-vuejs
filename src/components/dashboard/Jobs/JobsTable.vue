<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../../../stores/dashboard';
import JobModal from './JobModal.vue';
import ConfirmModal from '../global/ConfirmModal.vue';

const store = useDashboardStore();
const router = useRouter();

const searchQuery = ref('');
const statusFilter = ref('all');
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const modalMode = ref('add');
const selectedJob = ref(null);

// ─── Cover colors ────────────────────────────────────────────────────────────
const coverColors = [
  'from-indigo-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-red-500',
  'from-purple-400 to-pink-600',
];
const coverColor = (id) => coverColors[(id - 1) % coverColors.length];

// ─── Status helpers ──────────────────────────────────────────────────────────
const statusClass = (s) => ({
  'approved': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'pending':  'bg-amber-100 text-amber-700 border border-amber-200',
}[s] || 'bg-slate-100 text-slate-600');

// ─── Filtering ────────────────────────────────────────────────────────────────
const filtered = computed(() => {
  return store.jobs.filter(j => {
    const matchStatus = statusFilter.value === 'all' || j.status === statusFilter.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.facility.toLowerCase().includes(q) || j.author.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
});

// ─── Actions ─────────────────────────────────────────────────────────────────
const openAdd = () => { selectedJob.value = null; modalMode.value = 'add'; showFormModal.value = true; };
const openEdit = (j) => { selectedJob.value = j; modalMode.value = 'edit'; showFormModal.value = true; };
const openView = (j) => { router.push(`/admin/jobs/${j.id}`); };
const confirmDel = (j) => { selectedJob.value = j; showDeleteModal.value = true; };
const handleDelete = () => {
  if (selectedJob.value) { store.deleteJob(selectedJob.value.id); showDeleteModal.value = false; selectedJob.value = null; }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Job Posts</h1>
        <p class="text-sm text-slate-500">{{ store.jobCount }} job openings listed</p>
      </div>
      <button
        class="inline-flex items-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="openAdd"
      >
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Post a Job
      </button>
    </div>

    <!-- Stat Pills -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div class="bg-white rounded-xl border border-slate-200 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-slate-900">{{ store.jobCount }}</span>
        <span class="text-sm text-slate-500 font-medium">Total</span>
      </div>
      <div class="bg-white rounded-xl border border-emerald-200 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-emerald-600">{{ store.approvedJobCount }}</span>
        <span class="text-sm text-slate-500 font-medium">Approved</span>
      </div>
      <div class="bg-white rounded-xl border border-amber-200 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-amber-600">{{ store.pendingJobCount }}</span>
        <span class="text-sm text-slate-500 font-medium">Pending</span>
      </div>
    </div>

    <!-- Search + Filter -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-grow">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" v-model="searchQuery" class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-3 focus:ring-brand-primary/10 transition" placeholder="Search jobs, facilities, authors..."/>
      </div>
      <select v-model="statusFilter" class="min-w-[140px] p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-brand-primary cursor-pointer transition">
        <option value="all">All Status</option>
        <option value="approved">Approved</option>
        <option value="pending">Pending</option>
      </select>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <!-- Empty -->
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504 1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504-1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" />
          </svg>
        </div>
        <p class="text-sm font-semibold text-slate-600">No job posts found.</p>
        <button class="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-600 transition cursor-pointer" @click="searchQuery='';statusFilter='all'">Reset Filters</button>
      </div>

      <!-- Table -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Job Details</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Facility</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Author</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dates</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="job in filtered" :key="job.id" class="hover:bg-slate-50/50 transition-colors">
              <!-- Merged Column: Image + Title + Description snippet -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-4 min-w-[320px]">
                  <div :class="`w-14 h-14 rounded-xl bg-gradient-to-br ${coverColor(job.id)} flex-shrink-0 flex items-center justify-center shadow-sm text-white`">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.25m16.5 0a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25m16.5 0V9.45c0-.621-.504 1.125-1.125-1.125h-4.465m4.465 0a2.25 2.25 0 012.25 2.25v1.35m-16.5 0V9.45c0-.621.504 1.125 1.125-1.125h4.465m-4.465 0a2.25 2.25 0 00-2.25 2.25v1.35m7.5 0h3" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <button
                      class="text-sm font-bold text-slate-900 hover:text-brand-primary transition cursor-pointer text-left leading-snug truncate block w-full"
                      @click="openView(job)"
                    >
                      {{ job.title }}
                    </button>
                    <p class="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                      {{ job.description }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Facility -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                {{ job.facility }}
              </td>

              <!-- Author -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {{ job.author }}
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize" :class="statusClass(job.status)">
                  {{ job.status }}
                </span>
              </td>

              <!-- Dates -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-400 uppercase">Created</span>
                  <span class="text-xs text-slate-600 font-medium">{{ job.created_date }}</span>
                  <span class="text-[10px] font-bold text-rose-400 uppercase mt-1">Ends</span>
                  <span class="text-xs text-rose-600 font-bold">{{ job.end_date }}</span>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex justify-end gap-1.5">
                  <button class="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition cursor-pointer" title="View Job" @click="openView(job)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                  <button class="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition cursor-pointer" title="Edit Job" @click="openEdit(job)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                  <button class="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer" title="Delete Job" @click="confirmDel(job)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <JobModal :show="showFormModal" :job="selectedJob" :mode="modalMode" @close="showFormModal = false"/>
    <ConfirmModal :show="showDeleteModal" title="Delete Job Post" :message="`Are you sure you want to delete <strong>${selectedJob?.title}</strong>?`" confirm-text="Delete" @confirm="handleDelete" @close="showDeleteModal = false"/>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
</style>
