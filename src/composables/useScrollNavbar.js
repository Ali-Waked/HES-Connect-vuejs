import { onMounted, onUnmounted, ref } from 'vue';

export function useScrollNavbar(threshold = 10) {
  const isScrolled = ref(false);
  let frameId = 0;

  function update() {
    isScrolled.value = window.scrollY > threshold;
    frameId = 0;
  }

  function onScroll() {
    if (frameId) return;
    frameId = window.requestAnimationFrame(update);
  }

  onMounted(() => {
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll);
    if (frameId) window.cancelAnimationFrame(frameId);
  });

  return {
    isScrolled
  };
}
