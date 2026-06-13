<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllDoctors } from '../../api/public';
import AppNavbar from '../../components/global/AppNavbar.vue';
import LandingFooter from '../../components/landing/LandingFooter.vue';
import LandingSkeleton from '../../components/landing/LandingSkeleton.vue';

const router = useRouter();
const doctors = ref([]);
const loading = ref(true);

const avatarColors = ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'];
const initial = (name) => name?.replace('Dr. ', '').charAt(0) || '?';

onMounted(async () => {
  doctors.value = await getAllDoctors();
  loading.value = false;
});
</script>

<template>
  <div class="min-h-screen bg-landing-cream font-sans antialiased text-landing-dark">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-28 lg:pt-32">
      <div data-aos="fade-up">
        <button
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 cursor-pointer"
          @click="router.push('/')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
          Back to Home
        </button>

        <div class="max-w-2xl mb-10">
          <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Our Doctors</h1>
          <p class="text-slate-500 mt-2 text-lg">
            Meet our team of experienced healthcare professionals.
          </p>
        </div>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <LandingSkeleton variant="card" :count="6" />
      </div>

      <div v-else-if="doctors.length === 0" class="text-center py-20 text-slate-500">
        <p class="font-semibold">No doctors available at the moment.</p>
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(doc, i) in doctors"
          :key="doc.id"
          data-aos="fade-up"
          :data-aos-delay="(i % 6) * 50"
          class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-brand-primary/20 transition-all duration-200 text-center"
        >
          <div :class="`w-16 h-16 mx-auto mb-4 rounded-full ${avatarColors[i % avatarColors.length]} text-white text-xl font-bold flex items-center justify-center`">
            {{ initial(doc.name) }}
          </div>
          <h3 class="text-base font-bold text-slate-900 mb-1">{{ doc.name }}</h3>
          <p class="text-sm text-slate-500 mb-3">{{ doc.specialization }}</p>
          <div class="flex items-center justify-center gap-3 text-sm text-slate-600 mb-3">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              {{ doc.experience }} yrs
            </span>
            <span class="font-bold text-slate-800">${{ doc.fee }}</span>
          </div>
          <div class="flex items-center justify-center gap-1 text-sm mb-4">
            <span class="text-amber-500 font-bold">{{ doc.rating }}</span>
            <span class="text-slate-400">rating</span>
          </div>
          <button
            class="w-full py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition cursor-pointer"
            @click="router.push(`/doctors/${doc.id}`)"
          >View Profile</button>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
