<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center px-4 py-10 relative">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <router-link to="/" class="flex items-center justify-center gap-3 mb-8 group">
        <div class="w-11 h-11 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/30 group-hover:bg-teal-400 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <div class="text-left">
          <p class="text-white font-bold text-lg tracking-tight">Health Ecosystem</p>
          <p class="text-teal-400 text-[10px] font-bold tracking-widest uppercase">Gaza Strip</p>
        </div>
      </router-link>

      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 p-8">
        <div class="text-center mb-7">
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">{{ title }}</h1>
          <p v-if="subtitle" class="text-slate-500 text-sm mt-1.5">{{ subtitle }}</p>
        </div>

        <slot />
      </div>
    </div>
  </div>
</template>
