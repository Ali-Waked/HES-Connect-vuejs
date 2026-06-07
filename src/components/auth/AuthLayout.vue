<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
      <router-link to="/" class="mb-8 inline-flex items-center gap-3 self-center">
        <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7H5" />
          </svg>
        </span>
        <span class="text-left">
          <span class="block text-sm font-semibold tracking-tight text-slate-950">Health Ecosystem</span>
          <span class="block text-xs font-medium text-slate-500">Management System</span>
        </span>
      </router-link>

      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header class="mb-7">
          <h1 class="text-2xl font-semibold tracking-tight text-slate-950">{{ title }}</h1>
          <p v-if="subtitle" class="mt-2 text-sm leading-6 text-slate-500">{{ subtitle }}</p>
        </header>

        <slot />
      </section>
    </div>
  </main>
</template>
