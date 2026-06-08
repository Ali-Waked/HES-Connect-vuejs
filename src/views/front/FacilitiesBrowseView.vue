<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getFacilitiesTop } from '../../api/public';
import AppNavbar from '../../components/global/AppNavbar.vue';
import LandingFooter from '../../components/landing/LandingFooter.vue';
import LandingSkeleton from '../../components/landing/LandingSkeleton.vue';

const route = useRoute();
const router = useRouter();

const facilities = ref([]);
const loading = ref(true);

const typeLabels = {
  hospital: 'Hospitals',
  clinic: 'Clinics',
  medical_point: 'Medical Points',
  pharmacy: 'Pharmacies'
};

const pageTitle = computed(() => {
  const type = route.query.type;
  if (type && typeLabels[type]) return typeLabels[type];
  return 'All Facilities';
});

const filtered = computed(() => {
  let list = facilities.value;
  if (route.query.type) {
    list = list.filter(f => f.facility_type === route.query.type);
  }
  const q = (route.query.q || '').toString().toLowerCase().trim();
  if (q) {
    list = list.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.organization_name?.toLowerCase().includes(q)
    );
  }
  return list;
});

onMounted(async () => {
  facilities.value = await getFacilitiesTop(20);
  loading.value = false;
});
</script>

<template>
  <div class="min-h-screen bg-landing-cream dark:bg-slate-900 font-sans antialiased text-landing-dark">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-28 lg:pb-14 lg:pt-32">
      <div data-aos="fade-up">
        <button
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 cursor-pointer"
          @click="router.push('/')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
          Back to Home
        </button>

        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{{ pageTitle }}</h1>
        <p class="text-slate-500 dark:text-slate-400 mb-8">{{ filtered.length }} facilities found</p>
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <LandingSkeleton variant="card" :count="6" />
      </div>

      <div v-else-if="filtered.length === 0" class="text-center py-16 text-slate-500 dark:text-slate-400">
        No facilities match your search.
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(fac, i) in filtered"
          :key="fac.id"
          data-aos="fade-up"
          :data-aos-delay="(i % 6) * 50"
          class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition"
        >
          <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary capitalize mb-3">
            {{ fac.facility_type?.replace('_', ' ') }}
          </span>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{{ fac.name }}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">{{ fac.organization_name }}</p>
          <div class="flex items-center gap-1 text-sm text-amber-500">
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ fac.rating }}</span>
            <span class="text-slate-400 dark:text-slate-500">({{ fac.review_count }} reviews)</span>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
