<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useThemeStore } from '@/stores/useThemeStore';

const themeStore = useThemeStore();

onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      themeStore.setDark(e.matches);
    }
  });
});
</script>

<template>
  <RouterView />
</template>
