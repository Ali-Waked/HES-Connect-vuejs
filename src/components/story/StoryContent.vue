<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  content: { type: String, default: '' }
});

const expanded = ref(false);
const words = computed(() => props.content.split(/\s+/));
const isLong = computed(() => words.value.length > 400);
const displayContent = computed(() => {
  if (!isLong.value || expanded.value) return props.content;
  return words.value.slice(0, 400).join(' ') + '...';
});

function toggle() { expanded.value = !expanded.value; }
</script>

<template>
  <div class="relative rtl:text-right">
    <div class="transition-all duration-300" :class="{ 'max-h-none': expanded, 'max-h-[600px] overflow-hidden': isLong && !expanded }">
      <div v-for="(paragraph, i) in displayContent.split('\n').filter(p => p.trim())" :key="i"
        class="mb-4 text-base leading-relaxed text-slate-700 last:mb-0">
        {{ paragraph.trim() }}
      </div>
    </div>
    <div v-if="isLong && !expanded" class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    <button v-if="isLong" class="mt-2 text-sm font-bold text-brand-primary hover:text-brand-primary-hover transition"
      @click="toggle">
      {{ expanded ? $t('articles.readMore') + ' ▲' : $t('articles.readMore') + ' ▼' }}
    </button>
  </div>
</template>
