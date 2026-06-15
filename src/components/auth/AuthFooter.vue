<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="mt-8 pt-6 border-t border-slate-100">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-landing-muted">
      <p>&copy; {{ currentYear }} HES Connect. All rights reserved.</p>
      <div class="flex items-center gap-4">
        <router-link to="/about" class="hover:text-brand-primary transition-colors">About</router-link>
        <router-link to="/contact" class="hover:text-brand-primary transition-colors">Support</router-link>
        <router-link to="/privacy" class="hover:text-brand-primary transition-colors">Privacy</router-link>
        <router-link to="/terms" class="hover:text-brand-primary transition-colors">Terms</router-link>
      </div>
    </div>
  </footer>
</template>
