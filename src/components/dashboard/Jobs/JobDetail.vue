<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDashboardStore } from '../../../stores/dashboard';

const route = useRoute();
const router = useRouter();
const store = useDashboardStore();

const jobId = computed(() => parseInt(route.params.id));
const job = computed(() => store.jobs.find(j => j.id === jobId.value));

const goBack = () => router.push('/admin/jobs');

// ─── Status helpers ──────────────────────────────────────────────────────────
const statusClass = (s) => ({
  'approved': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'pending':  'bg-amber-100 text-amber-700 border border-amber-200',
}[s] || 'bg-slate-100 text-slate-600');
</script>

<template>
  <div v-if="job" class="max-w-4xl mx-auto space-y-6 animate-fade-in">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
      <button @click="goBack" class="hover:text-brand-primary transition cursor-pointer">Job Posts</button>
      <svg class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-slate-900 truncate max-w-[200px]">{{ job.title }}</span>
    </nav>

    <!-- Job Header Card -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-8 space-y-6">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
              {{ job.facility }}
            </span>
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize" :class="statusClass(job.status)">
              {{ job.status }}
            </span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {{ job.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-y-3 gap-x-6 pt-2 border-t border-slate-100 mt-6">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted By</span>
                <span class="text-sm font-bold text-slate-900">{{ job.author }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</span>
                <span class="text-sm font-bold text-rose-600">{{ job.end_date }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="prose prose-slate max-w-none pt-8 border-t border-slate-100">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Role Description</h3>
          <p class="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
            {{ job.description }}
          </p>
        </div>

        <!-- Application Info -->
        <div class="bg-slate-50 rounded-xl p-6 border border-slate-100 mt-8">
          <h3 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            How to Apply
          </h3>
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-500 font-medium">Please apply via {{ job.apply_method }}:</span>
            <a 
              v-if="job.apply_method === 'link'" 
              :href="job.apply_value" 
              target="_blank" 
              class="text-sm font-bold text-brand-primary hover:underline"
            >
              {{ job.apply_value }}
            </a>
            <span v-else class="text-sm font-bold text-slate-900">{{ job.apply_value }}</span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
        <button 
          v-if="job.status === 'pending'"
          @click="store.updateJobStatus(job.id, 'approved')"
          class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition cursor-pointer"
        >
          Approve Post
        </button>
        <button 
          @click="goBack"
          class="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-lg transition cursor-pointer"
        >
          Back to List
        </button>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else class="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
    <div class="w-12 h-12 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
    <p class="font-medium">Loading job post...</p>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
</style>
