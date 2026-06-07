<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex flex-col items-center justify-center px-6">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 text-center max-w-2xl">
      <!-- Logo -->
      <div class="flex items-center justify-center gap-3 mb-8">
        <div class="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <div class="text-left">
          <p class="text-white font-bold text-xl tracking-tight">Health Ecosystem</p>
          <p class="text-teal-400 text-xs font-bold tracking-widest uppercase">Gaza Strip</p>
        </div>
      </div>

      <!-- Headline -->
      <h1 class="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
        Coordinating Healthcare<br />
        <span class="text-teal-400">Across Gaza</span>
      </h1>
      <p class="text-slate-400 text-lg mb-10 leading-relaxed">
        A centralized platform for managing healthcare organizations, facilities, departments, and services throughout the Gaza Strip.
      </p>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          @click="router.push('/login')"
          class="inline-flex items-center gap-2 py-3.5 px-8 bg-teal-500 hover:bg-teal-400 text-white font-bold text-base rounded-xl shadow-lg shadow-teal-500/25 transition cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-500/30"
        >
          Sign in
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
        <button
          @click="router.push('/register')"
          class="inline-flex items-center gap-2 py-3.5 px-8 bg-white/10 hover:bg-white/15 text-white font-bold text-base rounded-xl border border-white/20 transition cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/20"
        >
          Create account
        </button>
      </div>
    </div>

    <!-- Footer -->
    <p class="absolute bottom-6 text-slate-600 text-xs">
      Health Ecosystem Admin Console · Gaza Strip · v1.0
    </p>
  </div>
</template>
