<script setup>
import { useRouter } from 'vue-router';
import { useNotificationsStore } from '../../../stores/notifications';

const emit  = defineEmits(['close']);
const store  = useNotificationsStore();
const router = useRouter();

const goToAll = () => {
  emit('close');
  router.push('/admin/notifications');
};

const handleClick = (n) => {
  store.markRead(n.id);
};
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-[90]" @click="$emit('close')"></div>

  <!-- Panel -->
  <div class="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden animate-drop-in">

    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <div class="flex items-center gap-2.5">
        <span class="text-sm font-bold text-slate-900">Notifications</span>
        <span
          v-if="store.unreadCount > 0"
          class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-brand-primary text-white text-[10px] font-bold rounded-full"
        >{{ store.unreadCount }}</span>
      </div>
      <button
        class="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer transition"
        @click="store.markAllRead()"
        v-if="store.hasUnread"
      >Mark all read</button>
    </div>

    <!-- Notifications list (last 5) -->
    <div class="divide-y divide-slate-50 max-h-[380px] overflow-y-auto">
      <div v-if="store.last5.length === 0" class="flex flex-col items-center justify-center py-12 gap-2">
        <div class="text-3xl">🔔</div>
        <p class="text-sm text-slate-500 font-medium">You're all caught up!</p>
      </div>

      <div
        v-for="n in store.last5"
        :key="n.id"
        class="flex gap-3 px-5 py-3.5 cursor-pointer transition-colors"
        :class="n.read ? 'bg-white hover:bg-slate-50/60' : 'bg-blue-50/40 hover:bg-blue-50/70'"
        @click="handleClick(n)"
      >
        <!-- Type icon -->
        <div class="flex-shrink-0 mt-0.5">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="store.getConfig(n.type).bg">
            <svg class="w-4.5 h-4.5" :class="store.getConfig(n.type).icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" v-html="store.getConfig(n.type).svg"></svg>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-slate-900 leading-snug">{{ n.title }}</p>
            <!-- Unread dot -->
            <span v-if="!n.read" class="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-brand-primary"></span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{{ n.message }}</p>
          <p class="text-[10px] text-slate-400 mt-1 font-medium">{{ n.timeAgo }}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/60">
      <button
        class="w-full text-center text-sm font-semibold text-teal-600 hover:text-teal-700 transition cursor-pointer py-1"
        @click="goToAll"
      >View all notifications →</button>
    </div>
  </div>
</template>

<style scoped>
.animate-drop-in {
  animation: dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top right;
}
@keyframes dropIn {
  from { opacity: 0; transform: scale(0.95) translateY(-8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
