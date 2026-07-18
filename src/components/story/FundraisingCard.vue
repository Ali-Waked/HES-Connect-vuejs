<script setup>
import { computed, ref, onMounted } from 'vue';
import DonateModal from './DonateModal.vue';
import ShareModal from './ShareModal.vue';

const props = defineProps({
  story: { type: Object, required: true }
});

const animated = ref(false);
const showDonate = ref(false);
const showShare = ref(false);

const progress = computed(() => {
  if (!props.story.isFundraising || props.story.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((props.story.collectedAmount / props.story.targetAmount) * 100));
});

const goalReached = computed(() => {
  return props.story.collectedAmount >= props.story.targetAmount;
});

const fmt = (n) => '$' + (n || 0).toLocaleString();

onMounted(() => {
  setTimeout(() => { animated.value = true }, 200);
});
</script>

<template>
  <div>
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <template v-if="story.isFundraising">
        <div class="flex items-baseline gap-2">
          <span class="material-symbols-outlined text-2xl text-brand-primary">redeem</span>
          <span class="text-2xl font-bold text-slate-900">{{ fmt(story.collectedAmount) }}</span>
          <span class="text-sm text-slate-500">raised of {{ fmt(story.targetAmount) }}</span>
        </div>

        <div class="mt-4">
          <div class="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div class="h-2.5 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-1000 ease-out"
              :style="{ width: animated ? progress + '%' : '0%' }"></div>
          </div>
          <div class="mt-1 flex items-center justify-between text-sm">
            <span class="font-bold text-brand-primary">{{ progress }}%</span>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">group</span>
            {{ story.donorCount }} donors
          </span>
          <span class="flex items-center gap-1 rounded-full bg-green-100/30 px-2.5 py-0.5 text-xs font-bold text-green-700">
            <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
            Active
          </span>
        </div>

        <template v-if="goalReached">
          <div class="mt-5 w-full rounded-lg bg-green-50 border border-green-200 py-3 px-4 text-center">
            <span class="text-sm font-bold text-green-700">Goal Reached</span>
            <p class="text-xs text-green-600 mt-0.5">Thank you for your amazing support!</p>
          </div>
        </template>
        <template v-else>
          <button
            class="mt-5 w-full rounded-lg bg-brand-primary py-3 text-sm font-bold text-white transition hover:bg-brand-primary-hover animate-pulse-once"
            @click="showDonate = true">
            Donate Now
          </button>
          <button
            class="mt-2 w-full rounded-lg border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            @click="showShare = true">
            Share This Story
          </button>
        </template>

        <div class="mt-5 border-t border-slate-100 pt-4 text-center">
          <p class="text-sm text-slate-500">
            <span class="text-brand-primary">💚</span> Be the reason she smiles
          </p>
        </div>
      </template>
      <template v-else>
        <div class="text-center py-4">
          <span class="material-symbols-outlined text-4xl text-slate-300">visibility</span>
          <p class="mt-2 text-sm font-semibold text-slate-700">This story is shared for awareness</p>
          <p class="mt-1 text-xs text-slate-500">Read and share to support the cause.</p>
        </div>
      </template>
    </div>

    <DonateModal :show="showDonate" :story="story" @close="showDonate = false" />
    <ShareModal :show="showShare" :story="story" @close="showShare = false" />
  </div>
</template>

<style scoped>
@keyframes pulse-once {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}
.animate-pulse-once {
  animation: pulse-once 0.6s ease-in-out 1;
}
</style>
