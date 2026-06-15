<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <section class="py-16 lg:py-20 bg-white border-t border-slate-100">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
      <h2 class="text-2xl sm:text-3xl font-bold text-slate-900">Need help finding the right care?</h2>
      <p class="text-slate-500 mt-3 max-w-xl mx-auto">Our team is here to help you navigate healthcare options and find the best provider for your needs.</p>
      <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          class="btn-primary px-7 py-3"
          @click="router.push('/contact')"
        >
          Get In Touch
        </button>
        <button
          class="btn-secondary px-7 py-3"
          @click="router.push('/facilities')"
        >
          Browse Facilities
        </button>
      </div>
    </div>
  </section>
</template>
