<script setup>
import { reactive, computed, watch } from 'vue';
import { useScrollReveal } from '../../composables/useScrollReveal';
import LandingSkeleton from './LandingSkeleton.vue';

const props = defineProps({
  overview: { type: Object, default: null },
  loading: { type: Boolean, default: true }
});

const { targetRef, isVisible } = useScrollReveal({ threshold: 0.3 });

const items = computed(() => [
  { key: 'total_users', label: 'Total Users' },
  { key: 'appointments_completed', label: 'Appointments Completed' },
  { key: 'articles_published', label: 'Articles Published' },
  { key: 'active_stories', label: 'Active Stories' },
  { key: 'total_donations', label: 'Total Donations', prefix: '$' }
]);

const animated = reactive({});

function animateCounts() {
  items.value.forEach((item) => {
    const end = props.overview?.[item.key] ?? 0;
    const startTime = performance.now();
    const duration = 2000;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      animated[item.key] = Math.floor(eased * end);
      if (progress < 1) requestAnimationFrame(tick);
      else animated[item.key] = end;
    };

    requestAnimationFrame(tick);
  });
}

watch(isVisible, (visible) => {
  if (visible && props.overview) animateCounts();
});
</script>

<template>
  <section ref="targetRef" class="py-14 lg:py-16 bg-brand-primary">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <LandingSkeleton variant="stat" :count="5" />
      </div>

      <div v-else class="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
        <div
          v-for="item in items"
          :key="item.key"
          class="text-center transition-all duration-700"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <p class="text-3xl sm:text-4xl font-extrabold text-white mb-1.5">
            <template v-if="item.prefix">$</template>{{ (animated[item.key] ?? 0).toLocaleString() }}
          </p>
          <p class="text-xs sm:text-sm font-medium text-white/80">{{ item.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
