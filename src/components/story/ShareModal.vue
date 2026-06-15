<script setup>
import { ref } from 'vue';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { resolveTranslatedValue } from '@/utils/locale';

const props = defineProps({ show: Boolean, story: Object });
const emit = defineEmits(['close']);
const store = useStoriesStore();
const copied = ref(false);

const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
const shareText = props.story ? `Support ${props.story.patientFirstName}'s story on HES Connect: ${resolveTranslatedValue(props.story.title)}` : '';

const shareLinks = {
  whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
  facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
  twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
};

function copyLink() {
  navigator.clipboard.writeText(shareUrl).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false }, 2000);
  }).catch(() => {
    store.showToast('Failed to copy link', 'error');
  });
}

function openShare(platform) {
  window.open(shareLinks[platform], '_blank', 'width=600,height=400');
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40/60 p-4 backdrop-blur-xs" @click.self="$emit('close')">
    <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 class="text-base font-bold text-slate-900">Share This Story</h2>
        <button class="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" @click="$emit('close')">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
      <div class="space-y-5 p-5">
        <div class="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p class="text-sm font-semibold text-slate-900 line-clamp-2">{{ resolveTranslatedValue(story?.title) }}</p>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold text-slate-700">Share via</p>
          <div class="grid grid-cols-2 gap-3">
            <button class="flex items-center gap-2 rounded-lg border border-green-200 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50" @click="openShare('whatsapp')">
              <span class="text-lg">🟢</span> WhatsApp
            </button>
            <button class="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50" @click="openShare('facebook')">
              <span class="text-lg">🔵</span> Facebook
            </button>
            <button class="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" @click="openShare('twitter')">
              <span class="text-lg">🐦</span> Twitter / X
            </button>
            <button class="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" @click="copyLink">
              <span class="text-lg">📋</span> {{ copied ? '✓ Copied!' : 'Copy Link' }}
            </button>
          </div>
        </div>
        <button class="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>
