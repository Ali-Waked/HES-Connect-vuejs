<script setup>
import { useScrollReveal } from '../../composables/useScrollReveal';

defineProps({
  id: { type: String, default: '' },
  className: { type: String, default: '' }
});

const { targetRef, isVisible } = useScrollReveal();
</script>

<template>
  <section
    :id="id"
    ref="targetRef"
    :class="[
      'transition-all duration-700 ease-out',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
      className
    ]"
  >
    <slot />
  </section>
</template>
