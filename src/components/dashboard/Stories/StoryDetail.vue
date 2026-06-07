<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDashboardStore } from '../../../stores/dashboard';

const route  = useRoute();
const router = useRouter();
const store  = useDashboardStore();

const showStatusMenu = ref(false);
const statusOptions = ['Approved', 'Pending', 'Rejected'];

// Find story by route param id
const story = computed(() => store.stories.find(s => s.id === Number(route.params.id)));

// Cover gradient palette (same as table thumbnails)
const coverGradients = [
  'from-teal-500 via-cyan-600 to-slate-700',
  'from-blue-500 via-indigo-600 to-slate-700',
  'from-purple-500 via-pink-600 to-slate-700',
  'from-orange-400 via-red-500 to-slate-700',
  'from-emerald-500 via-teal-600 to-slate-700',
];
const coverGradient = computed(() =>
  story.value ? coverGradients[(story.value.id - 1) % coverGradients.length] : coverGradients[0]
);

// Gallery placeholder colours
const galleryColors = [
  'from-teal-300 to-cyan-500',
  'from-blue-300 to-indigo-500',
  'from-purple-300 to-pink-500',
  'from-amber-300 to-orange-500',
  'from-emerald-300 to-teal-500',
  'from-rose-300 to-red-500',
];
const galleryColor = (idx) => galleryColors[idx % galleryColors.length];

// Gallery icon SVGs per slot
const galleryIcons = [
  `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 19.5h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"/>`,
  `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>`,
  `<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>`,
];

// Status badge style
const statusClass = (s) => ({
  'Approved': 'bg-emerald-500/90 text-white border-emerald-400/40',
  'Pending':  'bg-amber-500/90 text-white border-amber-400/40',
  'Rejected': 'bg-red-500/90 text-white border-red-400/40',
}[s] || 'bg-slate-500/90 text-white');

const statusIcon = (s) => ({
  'Approved': `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
  'Pending':  `<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
  'Rejected': `<path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
}[s] || '');

// Fundraising
const progress = computed(() =>
  story.value?.goal > 0 ? Math.min(100, Math.round((story.value.raised / story.value.goal) * 100)) : 0
);
const fmt = (n) => '$' + (n || 0).toLocaleString();

// Patient initial
const initial = computed(() => story.value?.patient?.charAt(0).toUpperCase() || '?');

// Gallery items (use existing gallery array length, generate placeholders)
const galleryItems = computed(() => story.value?.gallery || []);

const toggleStatusMenu = () => {
  showStatusMenu.value = !showStatusMenu.value;
};

const changeStatus = (status) => {
  if (story.value) {
    store.updateStoryStatus(story.value.id, status);
    showStatusMenu.value = false;
  }
};

const closeStatusMenu = () => {
  showStatusMenu.value = false;
};

onMounted(() => document.addEventListener('click', closeStatusMenu));
onUnmounted(() => document.removeEventListener('click', closeStatusMenu));
</script>

<template>
  <div class="space-y-5 animate-fade-in max-w-3xl">

    <!-- Not found -->
    <div v-if="!story" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="text-5xl">📖</div>
      <h2 class="text-xl font-bold text-slate-700">Story not found</h2>
      <button
        class="inline-flex items-center gap-2 py-2 px-4 text-sm font-semibold rounded-lg bg-brand-primary text-white hover:bg-brand-primary-hover transition cursor-pointer"
        @click="router.push('/admin/stories')"
      >← Back to Stories</button>
    </div>

    <template v-else>
      <!-- ── Back link ─────────────────────────────────────────────── -->
      <button
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer group"
        @click="router.push('/admin/stories')"
      >
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        Back to Stories
      </button>

      <!-- ── Hero Card ──────────────────────────────────────────────── -->
      <div
        class="relative rounded-2xl overflow-hidden h-[280px] bg-gradient-to-br shadow-lg"
        :class="coverGradient"
      >
        <!-- Dark gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

        <!-- Status badge — top right (clickable) -->
        <div class="absolute top-4 right-4" @click.stop>
          <button
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-sm cursor-pointer hover:brightness-110 transition"
            :class="statusClass(story.status)"
            @click.stop="toggleStatusMenu"
          >
            <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" v-html="statusIcon(story.status)"></svg>
            {{ story.status }}
            <svg class="w-3 h-3 opacity-70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>

          <div
            v-if="showStatusMenu"
            class="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-20"
            @click.stop
          >
            <button
              v-for="option in statusOptions"
              :key="option"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              :class="story.status === option ? 'bg-slate-50 text-brand-primary' : ''"
              @click="changeStatus(option)"
            >
              <span
                class="w-2 h-2 rounded-full"
                :class="{
                  'bg-emerald-500': option === 'Approved',
                  'bg-amber-500': option === 'Pending',
                  'bg-red-500': option === 'Rejected'
                }"
              ></span>
              {{ option }}
            </button>
          </div>
        </div>

        <!-- Bottom info overlay -->
        <div class="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
          <!-- Patient avatar -->
          <div class="relative flex-shrink-0">
            <div class="w-14 h-14 rounded-full bg-brand-primary text-white text-xl font-extrabold flex items-center justify-center shadow-lg border-2 border-white/30">
              {{ initial }}
            </div>
            <!-- Heart badge -->
            <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center">
              <svg class="w-2.5 h-2.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
              </svg>
            </div>
          </div>

          <!-- Title + patient + date -->
          <div class="min-w-0">
            <h1 class="text-xl font-extrabold text-white leading-snug mb-1 drop-shadow">{{ story.title }}</h1>
            <div class="flex items-center gap-2 text-sm text-white/80">
              <span class="font-semibold">{{ story.patient }}</span>
              <span class="text-white/40">·</span>
              <span>{{ story.created }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Fundraising Campaign ───────────────────────────────────── -->
      <div v-if="story.fundraising" class="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div class="flex items-center gap-2">
          <!-- Trend icon -->
          <svg class="w-4 h-4 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
          </svg>
          <h3 class="text-sm font-bold text-slate-900">Fundraising Campaign</h3>
        </div>

        <div class="flex justify-between items-start">
          <div>
            <p class="text-3xl font-extrabold text-slate-900 leading-none">{{ fmt(story.raised) }}</p>
            <p class="text-xs text-slate-400 mt-1 font-medium">collected</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-slate-500 leading-none">{{ fmt(story.goal) }}</p>
            <p class="text-xs text-slate-400 mt-1 font-medium">target</p>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            class="h-2.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-700"
            :style="`width:${progress}%`"
          ></div>
        </div>

        <p class="text-xs text-slate-400 text-right font-semibold">{{ progress }}% funded</p>
      </div>

      <!-- ── Story Content ──────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-5 rounded-full bg-teal-500"></div>
          <h3 class="text-sm font-bold text-slate-900">Story</h3>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed" style="font-size:0.9rem">
          {{ story.content || 'No story content provided yet.' }}
        </p>
      </div>

      <!-- ── Gallery ───────────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 rounded-full bg-teal-500"></div>
            <h3 class="text-sm font-bold text-slate-900">
              Gallery
              <span class="text-slate-400 font-medium ml-1">({{ galleryItems.length }} {{ galleryItems.length === 1 ? 'image' : 'images' }})</span>
            </h3>
          </div>
          <button class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 py-1.5 px-3 rounded-lg transition cursor-pointer border border-slate-200">
            <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Add image
          </button>
        </div>

        <!-- Image grid -->
        <div class="grid grid-cols-3 gap-3">
          <!-- Existing gallery items (gradient placeholders) -->
          <div
            v-for="(item, idx) in galleryItems"
            :key="item"
            class="aspect-square rounded-xl overflow-hidden bg-gradient-to-br flex items-center justify-center cursor-pointer group relative"
            :class="galleryColor(idx)"
          >
            <svg
              class="w-8 h-8 text-white/60 group-hover:scale-110 transition-transform"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.5"
              v-html="galleryIcons[idx % galleryIcons.length]"
            ></svg>
            <!-- hover overlay -->
            <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
              </svg>
            </div>
          </div>

          <!-- Add placeholder slot -->
          <div class="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-primary hover:bg-slate-50/60 transition-all group">
            <div class="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-brand-primary/10 flex items-center justify-center transition-colors">
              <svg class="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
            </div>
            <span class="text-xs font-semibold text-slate-400 group-hover:text-brand-primary transition-colors">Add</span>
          </div>
        </div>

        <!-- Empty gallery message -->
        <div v-if="galleryItems.length === 0" class="mt-3">
          <p class="text-xs text-slate-400 text-center py-2">No images uploaded yet. Click "Add image" to get started.</p>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.35s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
</style>
