<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '../../../stores/notifications'
import { useAuthStore } from '../../../stores/auth'

const TOAST_DURATION = 5000

const store = useNotificationsStore()
const authStore = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n()

const queue = ref([])
let timers = []

onMounted(() => {
  const userId = authStore.user?.uuid || authStore.user?.id
  if (userId) {
    store.subscribeToChannel(userId)
  }
})

onUnmounted(() => {
  store.leaveChannel()
})

function removeFromQueue(id) {
  const timerIdx = timers.findIndex(t => t.id === id)
  if (timerIdx !== -1) {
    clearTimeout(timers[timerIdx].handle)
    timers.splice(timerIdx, 1)
  }
  queue.value = queue.value.filter(n => n.toastId !== id)
}

function handleToastClick(n) {
  removeFromQueue(n.toastId)
  if (!n.read_at) store.markAsRead(n.uuid)
  if (n.action_url) router.push(n.action_url)
}

watch(
  () => store.lastRealtime,
  (n) => {
    if (!n) return
    const toastId = Date.now() + Math.random()
    n.toastId = toastId
    queue.value.push(n)
    if (queue.value.length > 3) {
      const removed = queue.value.shift()
      const timerIdx = timers.findIndex(t => t.id === removed.toastId)
      if (timerIdx !== -1) {
        clearTimeout(timers[timerIdx].handle)
        timers.splice(timerIdx, 1)
      }
    }
    const handle = setTimeout(() => removeFromQueue(toastId), TOAST_DURATION)
    timers.push({ id: toastId, handle })
  },
)
</script>

<template>
  <div
    class="fixed z-[200] flex flex-col gap-2.5 pointer-events-none"
    :class="locale === 'ar' ? 'bottom-6 left-6' : 'bottom-6 right-6'"
    :style="{ '--ntoast-offset': locale === 'ar' ? '-80px' : '80px' }"
  >
    <TransitionGroup name="ntoast">
      <div
        v-for="n in queue"
        :key="n.toastId"
        class="pointer-events-auto w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer group transition-shadow hover:shadow-xl"
        @click="handleToastClick(n)"
      >
        <div class="flex items-start gap-3 p-4">
          <div class="flex-shrink-0 mt-0.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="store.getConfig(n.type).bg">
              <svg class="w-[18px] h-[18px]" :class="store.getConfig(n.type).icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" v-html="store.getConfig(n.type).svg"></svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-bold text-slate-900 dark:text-white leading-snug truncate">{{ n.title }}</p>
              <button
                class="flex-shrink-0 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 p-0.5 rounded transition opacity-0 group-hover:opacity-100 cursor-pointer"
                @click.stop="removeFromQueue(n.toastId)"
              >
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{{ n.message }}</p>
          </div>
        </div>
        <div class="h-0.5 bg-slate-100 dark:bg-slate-800">
          <div class="h-full bg-brand-primary/60 animate-toast-progress" :style="{ animationDuration: `${TOAST_DURATION}ms` }"></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.ntoast-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.ntoast-leave-active {
  transition: all 0.25s ease-in;
}
.ntoast-enter-from {
  opacity: 0;
  transform: translateX(var(--ntoast-offset, 80px)) scale(0.92);
}
.ntoast-leave-to {
  opacity: 0;
  transform: translateX(var(--ntoast-offset, 80px)) scale(0.92);
}
@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}
.animate-toast-progress {
  animation: toastProgress linear forwards;
}
</style>
