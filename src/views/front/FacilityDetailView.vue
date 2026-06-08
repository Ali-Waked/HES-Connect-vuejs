<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppNavbar from '../../components/global/AppNavbar.vue';
import LandingFooter from '../../components/landing/LandingFooter.vue';
import MediaGallery from '../../components/shared/MediaGallery.vue';
import ReviewSummary from '../../components/reviews/ReviewSummary.vue';
import ReviewList from '../../components/reviews/ReviewList.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import * as publicApi from '../../api/public';

const route = useRoute();
const router = useRouter();
const facility = ref(null);
const loading = ref(true);
const notFound = ref(false);
const activeTab = ref('gallery');

const stats = ref({ average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });

onMounted(async () => {
  try {
    const data = await publicApi.getFacilityDetail(parseInt(route.params.id));
    if (!data) { notFound.value = true; return; }
    facility.value = data;
    const dist = {};
    data.reviews.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
    const total = data.reviews.length;
    const avg = total > 0 ? (data.reviews.reduce((s, r) => s + r.rating, 0) / total) : 0;
    stats.value = {
      average: avg.toFixed(1),
      total,
      distribution: { 5: dist[5] || 0, 4: dist[4] || 0, 3: dist[3] || 0, 2: dist[2] || 0, 1: dist[1] || 0 }
    };
  } finally {
    loading.value = false;
  }
});

const typeBadge = {
  hospital: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  clinic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pharmacy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medical_point: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
};
</script>

<template>
  <div class="min-h-screen bg-landing-cream dark:bg-slate-900 font-sans antialiased text-landing-dark">
    <AppNavbar variant="landing" />

    <main class="pt-20 lg:pt-[90px]">
      <template v-if="loading">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div class="h-4 bg-slate-200 dark:bg-slate-600 rounded w-48 animate-pulse"></div>
          <div class="aspect-video bg-slate-200 dark:bg-slate-600 rounded-xl animate-pulse"></div>
          <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-4">
              <div class="h-8 bg-slate-200 dark:bg-slate-600 rounded w-64 animate-pulse"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-600 rounded w-full animate-pulse"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4 animate-pulse"></div>
            </div>
            <div class="space-y-4">
              <div class="h-40 bg-slate-200 dark:bg-slate-600 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="notFound">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Facility Not Found</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">The facility you're looking for doesn't exist or has been removed.</p>
          <button class="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover transition cursor-pointer" @click="router.push('/facilities')">Browse Facilities</button>
        </div>
      </template>

      <template v-else-if="facility">
        <!-- Breadcrumb -->
        <div data-aos="fade-up" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <nav class="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <button class="hover:text-brand-primary transition cursor-pointer" @click="router.push('/')">Home</button>
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            <button class="hover:text-brand-primary transition cursor-pointer" @click="router.push('/facilities')">Facilities</button>
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            <span class="text-slate-600 dark:text-slate-400">{{ facility.name }}</span>
          </nav>
        </div>

        <!-- Header -->
        <div data-aos="fade-up" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                <svg class="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize" :class="typeBadge[facility.facility_type] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'">
                    {{ facility.facility_type?.replace('_', ' ') }}
                  </span>
                  <div class="flex items-center gap-1 text-sm">
                    <div class="flex items-center gap-0.5">
                      <svg v-for="s in 5" :key="s" class="w-3.5 h-3.5" :class="s <= Math.round(facility.rating) ? 'text-amber-400' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <span class="font-semibold text-slate-700 dark:text-slate-300">{{ facility.rating }}</span>
                    <span class="text-slate-400 dark:text-slate-500">({{ facility.review_count }} reviews)</span>
                  </div>
                </div>
                <h1 class="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">{{ facility.name }}</h1>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ facility.organization_name }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover shadow-md shadow-brand-primary/20 transition cursor-pointer">Book Appointment</button>
            </div>
          </div>
        </div>

        <!-- Gallery -->
        <div data-aos="fade-up" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <MediaGallery :images="facility.images" aspect-ratio="aspect-video" />
        </div>

        <!-- Content Grid -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-10">
              <!-- About -->
              <div data-aos="fade-up">
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">About this Facility</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ facility.description }}</p>
              </div>

              <!-- Doctors -->
              <div v-if="facility.doctors && facility.doctors.length > 0" data-aos="fade-up">
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Our Doctors</h2>
                <Swiper :modules="[Pagination]" :pagination="{ clickable: true, dynamicBullets: true }" :space-between="16" :slides-per-view="'auto'" class="pb-8">
                  <SwiperSlide v-for="doc in facility.doctors" :key="doc.id" class="!w-[220px]">
                    <div class="bg-white dark:bg-slate-800 rounded-xl border border-landing-border dark:border-slate-700 p-5 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-lg flex items-center justify-center">
                        {{ doc.name?.replace('Dr. ', '').charAt(0) || '?' }}
                      </div>
                      <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{{ doc.name }}</h3>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">{{ doc.specialization }}</p>
                      <div class="flex items-center justify-center gap-1 mb-3">
                        <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= Math.round(doc.rating) ? 'text-amber-400' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </div>
                      <button
                        class="w-full py-2 text-xs font-semibold text-brand-primary border border-brand-primary/40 rounded-lg hover:bg-brand-primary/5 transition cursor-pointer"
                        @click="router.push(`/doctors/${doc.id}`)"
                      >View Profile</button>
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>

              <!-- Reviews -->
              <div data-aos="fade-up">
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Patient Reviews</h2>
                <ReviewSummary :stats="stats" />
                <div class="mt-6">
                  <ReviewList :reviews="facility.reviews" :per-page="5" />
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              <div data-aos="fade-up" class="bg-white dark:bg-slate-800 rounded-xl border border-landing-border dark:border-slate-700 p-5 shadow-sm">
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Facility Information</h3>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <svg class="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Location</p>
                      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ facility.location }}</p>
                    </div>
                  </div>
                  <div v-if="facility.phone" class="flex items-start gap-3">
                    <svg class="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                    </svg>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone</p>
                      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ facility.phone }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div data-aos="fade-up" class="bg-white dark:bg-slate-800 rounded-xl border border-landing-border dark:border-slate-700 p-5 shadow-sm">
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Quick Actions</h3>
                <div class="space-y-2">
                  <button class="w-full py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-hover transition cursor-pointer">Book Appointment</button>
                  <button class="w-full py-2.5 text-sm font-semibold text-brand-primary border border-brand-primary/40 rounded-lg hover:bg-brand-primary/5 transition cursor-pointer">Share Facility</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>

    <LandingFooter />
  </div>
</template>
