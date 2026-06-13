<script setup>
import { useRouter } from 'vue-router';
import LandingSection from './LandingSection.vue';
import LandingSkeleton from './LandingSkeleton.vue';

defineProps({
  doctors: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const router = useRouter();

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
const initial = (name) => name?.replace('Dr. ', '').charAt(0) || '?';
</script>

<template>
  <LandingSection id="doctors" class="py-16 lg:py-20 bg-landing-warm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Our Top Doctors</h2>
        <button class="text-sm font-semibold text-brand-primary hover:underline transition cursor-pointer" @click="router.push('/facilities')">View All →</button>
      </div>

      <div v-if="loading" class="flex gap-5 overflow-hidden">
        <LandingSkeleton variant="card" :count="4" />
      </div>

      <div v-else class="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        <div
          v-for="(doc, idx) in doctors"
          :key="doc.id"
          class="snap-start shrink-0 w-[260px] bg-landing-cream rounded-xl border border-landing-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/20 transition-all duration-200 text-center"
        >
          <div :class="`w-16 h-16 mx-auto mb-4 rounded-full ${avatarColors[idx % avatarColors.length]} text-white text-xl font-bold flex items-center justify-center`">
            {{ initial(doc.name) }}
          </div>
          <h3 class="text-base font-bold text-slate-900 mb-1 dark:text-white">{{ doc.name }}</h3>
          <p class="text-sm text-slate-500 mb-3 dark:text-slate-400">{{ doc.specialization }}</p>
          <div class="flex items-center justify-center gap-3 text-sm text-slate-600 mb-3 dark:text-slate-400">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              {{ doc.experience }} yrs
            </span>
            <span class="font-bold text-slate-800 dark:text-slate-200">${{ doc.fee }}</span>
          </div>
          <div class="flex items-center justify-center gap-1 text-sm mb-4">
            <span class="text-amber-500 font-bold">{{ doc.rating }}</span>
            <span class="text-slate-400 dark:text-slate-500">rating</span>
          </div>
          <button
            class="w-full py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition cursor-pointer"
            @click="router.push('/login')"
          >Book Now</button>
        </div>
      </div>
    </div>
  </LandingSection>
</template>
