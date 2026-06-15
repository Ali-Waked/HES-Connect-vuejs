<script setup>
import { ref, computed } from 'vue';
import { useNotificationsStore } from '../../../stores/notifications';

const store       = useNotificationsStore();
const unreadOnly  = ref(false);

const displayed = computed(() =>
  unreadOnly.value ? store.notifications.filter(n => !n.read) : store.notifications
);

const handleMarkRead = (n) => {
  if (!n.read) store.markRead(n.id);
};
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- ── Page Header ────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
        <p class="text-sm text-slate-500 mt-1">
          {{ store.unreadCount > 0 ? `${store.unreadCount} unread` : 'All caught up' }}
          · {{ store.notifications.length }} total
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Unread toggle -->
        <button
          class="inline-flex items-center gap-2 py-2 px-3.5 rounded-lg border text-sm font-semibold transition cursor-pointer"
          :class="unreadOnly
            ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/15'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
          @click="unreadOnly = !unreadOnly"
        >
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
          </svg>
          {{ unreadOnly ? 'Unread only' : 'All' }}
          <span v-if="unreadOnly && store.unreadCount" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-[10px] font-bold">{{ store.unreadCount }}</span>
        </button>

        <!-- Mark all read -->
        <button
          v-if="store.hasUnread"
          class="inline-flex items-center gap-2 py-2 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          @click="store.markAllRead()"
        >
          <svg class="w-4 h-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Mark all as read
        </button>
      </div>
    </div>

    <!-- ── Notifications List ─────────────────────────────────────── -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">

      <!-- Empty state -->
      <div v-if="displayed.length === 0" class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl">🔔</div>
        <p class="text-sm font-semibold text-slate-600">
          {{ unreadOnly ? 'No unread notifications' : "You're all caught up!" }}
        </p>
        <button
          v-if="unreadOnly"
          class="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer transition"
          @click="unreadOnly = false"
        >Show all notifications</button>
      </div>

      <!-- Items -->
      <div class="divide-y divide-slate-100">
        <div
          v-for="n in displayed"
          :key="n.id"
          class="flex items-start gap-4 px-6 py-4 transition-colors group"
          :class="n.read ? 'bg-white hover:bg-slate-50/50' : 'bg-blue-50/30 hover:bg-blue-50/60'"
        >
          <!-- Icon -->
          <div class="flex-shrink-0 mt-0.5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="store.getConfig(n.type).bg">
              <svg
                class="w-5 h-5"
                :class="store.getConfig(n.type).icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24"
                stroke-width="1.8" stroke="currentColor"
                v-html="store.getConfig(n.type).svg"
              ></svg>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-slate-900 leading-snug">{{ resolveTranslatedValue(n.title) }}</p>
                <p class="text-sm text-slate-500 mt-0.5 leading-relaxed">{{ n.message }}</p>
              </div>
              <!-- Time + unread dot -->
              <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span class="text-xs text-slate-400 whitespace-nowrap font-medium">{{ n.timeAgo }}</span>
                <span v-if="!n.read" class="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0"></span>
              </div>
            </div>
          </div>

          <!-- Mark as read button (shown on hover if unread) -->
          <button
            v-if="!n.read"
            class="flex-shrink-0 mt-1 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            title="Mark as read"
            @click="handleMarkRead(n)"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </button>

          <!-- Dismiss button (shown on hover if read) -->
          <button
            v-else
            class="flex-shrink-0 mt-1 text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            title="Dismiss"
            @click="store.dismiss(n.id)"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
