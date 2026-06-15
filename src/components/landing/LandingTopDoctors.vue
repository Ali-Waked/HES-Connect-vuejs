<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { resolveTranslatedValue, getNameInitial } from '../../utils/locale';

defineProps({
  doctors: { type: Array, default: () => [] },
  loading: { type: Boolean, default: true }
});

const router = useRouter();
const { locale } = useI18n();

const avatarColors = ['bg-brand-primary', 'bg-brand-accent', 'bg-warning', 'bg-danger'];
const initial = (name) => getNameInitial(name, locale.value);
</script>

<template>
  <section class="py-16 lg:py-20 bg-slate-50 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-10 animate-fade-in-up">
        <div>
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900">Our Top Doctors</h2>
          <p class="text-slate-500 mt-2">Expert healthcare professionals ready to serve you.</p>
        </div>
        <button class="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition cursor-pointer" @click="router.push('/facilities')">
          View All
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>
      </div>

      <div v-if="loading" class="flex gap-6 overflow-x-auto pb-4">
        <div v-for="n in 4" :key="n" class="shrink-0 w-64 h-72 bg-white rounded-lg border border-slate-200 animate-pulse"></div>
      </div>

      <div v-else class="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
        <div
          v-for="(doc, idx) in doctors"
          :key="doc.id"
          class="snap-start shrink-0 w-64 bg-white rounded-lg border border-slate-200 p-6 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center animate-fade-in-up"
          :style="{ animationDelay: `${idx * 0.1}s` }"
        >
          <div class="relative w-20 h-20 mx-auto mb-5">
            <div :class="`w-20 h-20 rounded-full ${avatarColors[idx % avatarColors.length]} text-white text-2xl font-bold flex items-center justify-center`">
              {{ initial(doc.name) }}
            </div>
            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-1">{{ resolveTranslatedValue(doc.name, locale.value) }}</h3>
          <p class="text-sm text-slate-500 mb-4">{{ resolveTranslatedValue(doc.specialization, locale.value) }}</p>
          <div class="flex items-center justify-center gap-4 text-sm border-t border-slate-100 pt-4">
            <span class="flex items-center gap-1 text-amber-500 font-bold">
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              {{ doc.rating }}
            </span>
            <span class="text-slate-400">{{ doc.experience }} yrs exp.</span>
            <span class="font-bold text-slate-800">${{ doc.fee }}</span>
          </div>
          <button
            class="w-full mt-4 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition cursor-pointer"
            @click="router.push('/login')"
          >Book Appointment</button>
        </div>
      </div>
    </div>
  </section>
</template>
