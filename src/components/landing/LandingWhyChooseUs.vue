<script setup>
const features = [
  {
    title: 'Trusted Healthcare Providers',
    description: 'All facilities and professionals are thoroughly verified to ensure the highest quality of care.',
    imageSide: 'left',
    color: 'bg-brand-primary/5',
    accent: 'bg-brand-primary',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Verified Facilities',
    description: 'Every facility undergoes rigorous credentialing to meet our strict healthcare standards.',
    imageSide: 'right',
    color: 'bg-brand-primary-lighter',
    accent: 'bg-brand-primary',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Easy Access to Information',
    description: 'Find detailed profiles, reviews, and availability information for informed healthcare decisions.',
    imageSide: 'left',
    color: 'bg-surface-cool',
    accent: 'bg-brand-accent',
    icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Community Health Support',
    description: 'Committed to improving community health outcomes through accessible and equitable care.',
    imageSide: 'right',
    color: 'bg-success-light',
    accent: 'bg-success',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
  }
];
</script>

<template>
  <section class="py-16 lg:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16 animate-fade-in-up">
        <h2 class="text-3xl sm:text-4xl font-bold text-slate-900">Why Choose Us</h2>
        <p class="text-slate-500 mt-3 max-w-2xl mx-auto">We are dedicated to providing a seamless healthcare experience for everyone in our community.</p>
      </div>

      <div class="space-y-16 lg:space-y-24">
        <div
          v-for="(feature, idx) in features"
          :key="idx"
          class="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center animate-fade-in-up"
          :style="{ animationDelay: `${idx * 0.1}s` }"
        >
          <div v-if="feature.imageSide === 'left'" :class="`rounded-3xl ${feature.color} p-8 lg:p-12 aspect-[4/3] flex items-center justify-center order-1 lg:order-1`">
            <div class="w-full h-full max-w-[200px] mx-auto flex flex-col items-center justify-center">
              <div :class="`w-20 h-20 ${feature.accent} rounded-2xl flex items-center justify-center mb-6`">
                <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="feature.icon"/>
                </svg>
              </div>
              <div class="w-full space-y-2">
                <div class="h-1.5 rounded-full bg-white/60"></div>
                <div class="h-1.5 rounded-full bg-white/40 w-3/4"></div>
                <div class="h-1.5 rounded-full bg-white/30 w-1/2"></div>
              </div>
            </div>
          </div>

          <div :class="feature.imageSide === 'left' ? 'order-2 lg:order-2' : 'order-1 lg:order-1'">
            <div class="eyebrow-badge mb-4">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
              Feature {{ idx + 1 }}
            </div>
            <h3 class="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">{{ feature.title }}</h3>
            <p class="text-slate-500 leading-relaxed text-lg">{{ feature.description }}</p>
          </div>

          <div v-if="feature.imageSide === 'right'" :class="`rounded-3xl ${feature.color} p-8 lg:p-12 aspect-[4/3] flex items-center justify-center order-1 lg:order-2`">
            <div class="w-full h-full max-w-[200px] mx-auto flex flex-col items-center justify-center">
              <div :class="`w-20 h-20 ${feature.accent} rounded-2xl flex items-center justify-center mb-6`">
                <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="feature.icon"/>
                </svg>
              </div>
              <div class="w-full space-y-2">
                <div class="h-1.5 rounded-full bg-white/60"></div>
                <div class="h-1.5 rounded-full bg-white/40 w-3/4"></div>
                <div class="h-1.5 rounded-full bg-white/30 w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
