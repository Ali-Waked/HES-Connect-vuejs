<script setup>
import HesLogo from '@/components/global/HesLogo.vue'

defineProps({
  variant: { type: String, default: 'centered' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  showBrand: { type: Boolean, default: true },
})
</script>

<template>
  <!-- Split layout for Login/Register -->
  <div v-if="variant === 'split'" class="min-h-screen flex font-sans antialiased">
    <!-- Left brand panel -->
    <div class="hidden lg:flex lg:w-[45%] bg-landing-dark relative overflow-hidden flex-col items-center justify-center p-12">
      <div class="hero-grid-pattern absolute inset-0 opacity-30"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-brand-primary/90 via-brand-primary/80 to-brand-primary-dark/90"></div>

      <div class="relative z-10 max-w-sm text-center">
        <div class="flex justify-center mb-8">
          <HesLogo variant="full" :height="56" theme="white" />
        </div>

        <p class="text-white/80 text-base leading-relaxed mb-12">
          Connecting healthcare ecosystems with seamless digital infrastructure for hospitals, organizations, and practitioners.
        </p>

        <div class="grid grid-cols-3 gap-6 mb-12">
          <div class="text-center">
            <div class="text-2xl font-bold text-white">500+</div>
            <div class="text-xs text-white/60 mt-1">Healthcare Facilities</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">12K+</div>
            <div class="text-xs text-white/60 mt-1">Medical Professionals</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">1M+</div>
            <div class="text-xs text-white/60 mt-1">Patient Records</div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 text-xs text-white/50">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span>HIPAA Compliant &middot; SOC 2 Certified &middot; ISO 27001</span>
        </div>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="flex-1 flex items-center justify-center bg-landing-cream p-4 sm:p-8">
      <div class="w-full max-w-md">
        <div class="text-center mb-8 lg:hidden">
          <router-link to="/" aria-label="HES Connect Home" class="inline-flex justify-center">
            <HesLogo variant="full" :height="40" theme="light" />
          </router-link>
        </div>
        <slot />
      </div>
    </div>
  </div>

  <!-- Centered layout for other auth pages -->
  <div v-else class="min-h-screen flex flex-col items-center justify-center bg-landing-cream px-4 py-12 font-sans antialiased">
    <div class="w-full max-w-md">
      <div v-if="showBrand" class="text-center mb-8">
        <router-link to="/" aria-label="HES Connect Home" class="inline-flex justify-center">
          <HesLogo variant="full" :height="40" theme="light" />
        </router-link>
      </div>
      <slot />
    </div>
    <div class="mt-8 text-center text-xs text-landing-muted">
      <p>&copy; {{ new Date().getFullYear() }} HES Connect. All rights reserved.</p>
    </div>
  </div>
</template>
