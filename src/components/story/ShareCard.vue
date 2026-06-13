<script setup>
import { ref } from 'vue';
import { useStoriesStore } from '@/stores/useStoriesStore';

const props = defineProps({
  story: { type: Object, required: true }
});

const store = useStoriesStore();
const copied = ref(false);

const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
const shareText = `Support ${props.story.patientFirstName}'s story on Health Garagantam: ${props.story.title}`;

const shares = [
  { icon: '🟢', label: 'WhatsApp', color: 'hover:bg-green-50 text-green-600', url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}` },
  { icon: '🔵', label: 'Facebook', color: 'hover:bg-blue-50 text-blue-600', url: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}` },
  { icon: '🐦', label: 'Twitter/X', color: 'hover:bg-slate-100 text-slate-600', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
  { icon: '📋', label: 'Copy Link', color: 'hover:bg-slate-100 text-slate-600', url: null }
];

function handleShare(s) {
  if (s.url) {
    window.open(s.url, '_blank', 'width=600,height=400');
  } else {
    navigator.clipboard.writeText(shareUrl).then(() => {
      copied.value = true;
      setTimeout(() => { copied.value = false }, 2000);
    });
  }
}
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 class="mb-4 text-sm font-bold text-slate-900">Share & Spread the Word</h3>
    <div class="flex gap-2">
      <button v-for="s in shares" :key="s.label"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-sm transition"
        :class="s.color"
        :title="s.label"
        @click="handleShare(s)">
        {{ s.icon }}
      </button>
    </div>
    <p v-if="copied" class="mt-2 text-xs font-semibold text-green-600">✓ Link copied!</p>
  </div>
</template>
