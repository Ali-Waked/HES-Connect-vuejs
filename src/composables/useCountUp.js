import { ref, watch } from 'vue';

export function useCountUp(targetValue, options = {}) {
  const { duration = 2000, enabled = ref(false) } = options;
  const display = ref(0);

  watch(
    () => (typeof enabled === 'object' ? enabled.value : enabled),
    (start) => {
      if (!start) return;
      const end = Number(targetValue) || 0;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        display.value = Math.floor(eased * end);
        if (progress < 1) requestAnimationFrame(tick);
        else display.value = end;
      };

      requestAnimationFrame(tick);
    },
    { immediate: true }
  );

  return display;
}
