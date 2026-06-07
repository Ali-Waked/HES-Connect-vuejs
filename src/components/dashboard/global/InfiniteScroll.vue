<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['load']);
const scrollTrigger = ref(null);

let observer = null;

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !props.loading && !props.disabled) {
      emit('load');
    }
  }, { rootMargin: '100px' });

  if (scrollTrigger.value) {
    observer.observe(scrollTrigger.value);
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <div class="space-y-4">
    <slot />
    
    <div ref="scrollTrigger" class="h-10 flex items-center justify-center">
      <div v-if="loading" class="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest">
        <div class="w-4 h-4 border-2 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
        Loading more...
      </div>
    </div>
  </div>
</template>
