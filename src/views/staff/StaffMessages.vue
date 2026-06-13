<template>
  <div class="animate-fade-in h-[calc(100vh-140px)]">
    <div class="flex h-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="w-full sm:w-80 border-r border-slate-200 flex-col" :class="activeConv ? 'hidden sm:flex' : 'flex'">
        <div class="p-4 border-b border-slate-100">
          <h3 class="font-bold text-slate-900">Messages</h3>
        </div>
        <div class="flex-1 overflow-y-auto">
          <button v-for="conv in store.conversations" :key="conv.id" class="w-full flex items-center gap-3 p-4 text-left transition hover:bg-slate-50 border-b border-slate-50" :class="selectedId === conv.id ? 'bg-brand-primary/5' : ''" @click="selectConv(conv.id)">
            <AvatarInitial :name="conv.participantName" size="sm" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-sm text-slate-900 truncate">{{ conv.participantName }}</span>
                <span class="text-xs text-slate-400">{{ conv.lastTime }}</span>
              </div>
              <p class="text-xs text-slate-500 truncate">{{ conv.lastMessage }}</p>
            </div>
            <span v-if="conv.unreadCount" class="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{{ conv.unreadCount }}</span>
          </button>
        </div>
      </div>

      <div class="flex-1 flex-col" :class="!activeConv ? 'hidden sm:flex' : 'flex'">
        <template v-if="currentConv">
          <div class="flex items-center gap-3 p-4 border-b border-slate-100">
            <button class="sm:hidden text-slate-500" @click="activeConv = false">← Back</button>
            <AvatarInitial :name="currentConv.participantName" size="sm" />
            <div>
              <p class="font-semibold text-sm text-slate-900">{{ currentConv.participantName }}</p>
              <p class="text-xs text-slate-500">{{ currentConv.participantRole }}</p>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-for="msg in currentConv.messages" :key="msg.id" class="flex" :class="msg.isMe ? 'justify-end' : 'justify-start'">
              <div class="max-w-[75%] rounded-xl px-4 py-2.5 text-sm" :class="msg.isMe ? 'bg-brand-primary text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'">
                <p>{{ msg.text }}</p>
                <p class="text-xs mt-1" :class="msg.isMe ? 'text-white/70' : 'text-slate-400'">{{ msg.time }}</p>
              </div>
            </div>
          </div>
          <div class="border-t border-slate-100 p-4">
            <form @submit.prevent="send" class="flex gap-2">
              <input v-model="messageText" placeholder="Type a message..." class="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm" />
              <button type="submit" class="rounded-lg bg-brand-primary px-4 py-2.5 text-sm text-white" :disabled="!messageText.trim()">Send</button>
            </form>
          </div>
        </template>
        <div v-else class="flex-1 flex items-center justify-center text-slate-400">
          <div class="text-center">
            <span class="material-symbols-outlined text-5xl">chat</span>
            <p class="mt-2 text-sm">Select a conversation</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'

const store = useStaffStore()
const activeConv = ref(false)
const selectedId = ref(null)
const messageText = ref('')

const currentConv = computed(() => store.conversations.find(c => c.id === selectedId.value))

function selectConv(id) { selectedId.value = id; activeConv.value = true }

function send() {
  if (!messageText.value.trim() || !selectedId.value) return
  store.sendMessage(selectedId.value, messageText.value)
  messageText.value = ''
}
</script>
