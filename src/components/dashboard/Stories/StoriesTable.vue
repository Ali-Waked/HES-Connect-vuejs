<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../../../stores/dashboard';
import StoryModal from './StoryModal.vue';
import ConfirmModal from '../global/ConfirmModal.vue';

const store = useDashboardStore();
const router = useRouter();

const searchQuery = ref('');
const statusFilter = ref('all');
const showFormModal = ref(false);
const showDeleteModal = ref(false);
const modalMode = ref('add');
const selectedStory = ref(null);

// â”€â”€â”€ Story cover colour palette (used for placeholder thumbnails) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const coverColors = [
  'from-teal-400 to-cyan-600',
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',
  'from-orange-400 to-red-500',
  'from-emerald-400 to-teal-600',
];
const coverColor = (id) => coverColors[(id - 1) % coverColors.length];

// â”€â”€â”€ Status helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const statusClass = (s) => ({
  'Approved': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'Pending':  'bg-amber-100 text-amber-700 border border-amber-200',
  'Rejected': 'bg-red-100 text-red-600 border border-red-200',
}[s] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400');

const statusIcon = (s) => ({
  'Approved': `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
  'Pending':  `<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
  'Rejected': `<path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
}[s] || '');

// Patient initial + avatar colour
const patientInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';
const avatarColor = (name) => {
  const colors = ['bg-teal-500','bg-blue-500','bg-purple-500','bg-orange-500','bg-rose-500','bg-indigo-500'];
  return colors[name.charCodeAt(0) % colors.length];
};

// Fundraising progress %
const progress = (raised, goal) => goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
const formatMoney = (n) => '$' + n.toLocaleString();

// â”€â”€â”€ Filtering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const filtered = computed(() => {
  return store.stories.filter(s => {
    const matchStatus = statusFilter.value === 'all' || s.status === statusFilter.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.patient.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
});

// â”€â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const openAdd = () => { selectedStory.value = null; modalMode.value = 'add'; showFormModal.value = true; };
const openEdit = (s) => { selectedStory.value = s; modalMode.value = 'edit'; showFormModal.value = true; };
const openView = (s) => { router.push(`/admin/stories/${s.id}`); };
const confirmDel = (s) => { selectedStory.value = s; showDeleteModal.value = true; };
const handleDelete = () => {
  if (selectedStory.value) { store.deleteStory(selectedStory.value.id); showDeleteModal.value = false; selectedStory.value = null; }
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex justify-between items-start">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Patient Stories</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ store.storyCount }} {{ store.storyCount === 1 ? 'story' : 'stories' }} submitted</p>
      </div>
      <button
        class="inline-flex items-center gap-1.5 py-2.5 px-4.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-primary/15 transition cursor-pointer"
        @click="openAdd"
      >
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        Add Story
      </button>
    </div>

    <!-- Stat Pills -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <!-- Total -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ store.storyCount }}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">Total</span>
      </div>
      <!-- Approved -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-emerald-600">{{ store.approvedStoryCount }}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">Approved</span>
      </div>
      <!-- Pending -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-amber-200 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-amber-600">{{ store.pendingStoryCount }}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending</span>
      </div>
      <!-- Fundraising -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-rose-200 px-5 py-3.5 flex items-center gap-3 shadow-xs">
        <span class="text-lg font-bold text-rose-600">{{ store.fundraisingStoryCount }}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">Fundraising</span>
      </div>
    </div>

    <!-- Search + Filter -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-grow">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" v-model="searchQuery" class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition" placeholder="Search stories..."/>
      </div>
      <select v-model="statusFilter" class="min-w-[140px] p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer transition">
        <option value="all">All Status</option>
        <option value="Approved">Approved</option>
        <option value="Pending">Pending</option>
        <option value="Rejected">Rejected</option>
      </select>
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
      <!-- Empty -->
      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
        </div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">No stories match your criteria.</p>
        <button class="py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 transition cursor-pointer" @click="searchQuery='';statusFilter='all'">Reset Filters</button>
      </div>

      <!-- Table -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Story</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fundraising</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
              <th class="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="story in filtered" :key="story.id" class="hover:bg-slate-50/50 transition-colors">
              <!-- Story Title + Cover -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3 min-w-[220px]">
                  <!-- Thumbnail -->
                  <div :class="`w-11 h-11 rounded-lg bg-gradient-to-br ${coverColor(story.id)} flex-shrink-0 flex items-center justify-center`">
                    <svg class="w-5 h-5 text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 19.5h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"/>
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <button
                      class="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate max-w-[200px] hover:text-brand-primary transition cursor-pointer text-left"
                      :title="story.title"
                      @click="openView(story)"
                    >{{ story.title }}</button>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ story.images }} {{ story.images === 1 ? 'image' : 'images' }}</p>
                  </div>
                </div>
              </td>

              <!-- Patient -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <div :class="`w-7 h-7 rounded-full ${avatarColor(story.patient)} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`">
                    {{ patientInitial(story.patient) }}
                  </div>
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ story.patient }}</span>
                </div>
              </td>

              <!-- Status Badge -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" :class="statusClass(story.status)">
                  <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" v-html="statusIcon(story.status)"></svg>
                  {{ story.status }}
                </span>
              </td>

              <!-- Fundraising -->
              <td class="px-6 py-4">
                <div v-if="story.fundraising" class="min-w-[120px]">
                  <div class="flex items-center gap-1 mb-1.5">
                    <svg class="w-3.5 h-3.5 text-rose-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
                    </svg>
                    <span class="text-xs font-bold text-rose-600">Fundraising</span>
                  </div>
                  <!-- Progress Bar -->
                  <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-1">
                    <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" :style="`width:${progress(story.raised, story.goal)}%`"></div>
                  </div>
                  <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ formatMoney(story.raised) }}</p>
                </div>
                <span v-else class="text-slate-300 dark:text-slate-500 text-sm">â€”</span>
              </td>

              <!-- Created -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{{ story.created }}</td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex justify-end gap-1.5">
                  <button class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition cursor-pointer" title="View Story" @click="openView(story)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                  <button class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-lg transition cursor-pointer" title="Edit Story" @click="openEdit(story)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                  <button class="text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer" title="Delete Story" @click="confirmDel(story)">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <StoryModal :show="showFormModal" :story="selectedStory" :mode="modalMode" @close="showFormModal = false"/>
    <ConfirmModal :show="showDeleteModal" title="Delete Story" :message="`Are you sure you want to delete <strong>${selectedStory?.title}</strong>?`" confirm-text="Delete" @confirm="handleDelete" @close="showDeleteModal = false"/>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
</style>
