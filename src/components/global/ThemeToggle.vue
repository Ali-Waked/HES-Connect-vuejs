<script setup>
import { useThemeStore } from '@/stores/useThemeStore'
const theme = useThemeStore()
</script>

<template>
  <button
    @click="theme.toggle()"
    class="relative p-2 rounded-full transition-colors duration-200 cursor-pointer
           text-slate-500 hover:text-slate-800 hover:bg-slate-100
           dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
    :title="theme.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <svg v-if="theme.isDark" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12
           18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75
           12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
    </svg>
    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75
           9.75 9.75 0 0 1 8.25 6 9.77 9.77 0 0 1
           8.998 2.252 10.002 10.002 0 0 0 21.752 15.002Z"/>
    </svg>
  </button>
</template>
