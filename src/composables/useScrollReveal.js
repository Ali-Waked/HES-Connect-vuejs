import { ref, onMounted, onUnmounted } from 'vue';

export function useScrollReveal(options = {}) {
  const { threshold = 0.12, rootMargin = '0px 0px -40px 0px' } = options;
  const targetRef = ref(null);
  const isVisible = ref(false);
  let observer = null;

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
          observer?.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    if (targetRef.value) observer.observe(targetRef.value);
  });

  onUnmounted(() => observer?.disconnect());

  return { targetRef, isVisible };
}
