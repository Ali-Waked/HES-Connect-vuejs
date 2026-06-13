<script setup>
import { ref, computed, onMounted } from 'vue';
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
const doctor = ref(null);
const loading = ref(true);
const notFound = ref(false);

const stats = ref({ average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });

onMounted(async () => {
  try {
    const data = await publicApi.getDoctorDetail(parseInt(route.params.id));
    if (!data) { notFound.value = true; return; }
    doctor.value = data;
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

const hasGallery = computed(() => doctor.value?.gallery?.length > 0);
</script>

<template>
  <div class="min-h-screen bg-landing-cream font-sans antialiased text-landing-dark">
    <AppNavbar variant="landing" />

    <main class="pt-20 lg:pt-[90px]">
      <template v-if="loading">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div class="h-4 bg-slate-200 rounded w-48 animate-pulse"></div>
          <div class="flex flex-col lg:flex-row gap-8">
            <div class="w-full lg:w-1/3 aspect-square bg-slate-200 rounded-2xl animate-pulse"></div>
            <div class="flex-1 space-y-4">
              <div class="h-8 bg-slate-200 rounded w-64 animate-pulse"></div>
              <div class="h-4 bg-slate-200 rounded w-48 animate-pulse"></div>
              <div class="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
              <div class="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="notFound">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-900 mb-2">Doctor Not Found</h2>
          <p class="text-sm text-slate-500 mb-6">The doctor you're looking for doesn't exist or has been removed.</p>
          <button class="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover transition cursor-pointer" @click="router.push('/')">Go Home</button>
        </div>
      </template>

      <template v-else-if="doctor">
        <!-- Breadcrumb -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <nav class="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <button class="hover:text-brand-primary transition cursor-pointer" @click="router.push('/')">Home</button>
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            <span class="text-slate-600">Doctors</span>
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            <span class="text-slate-600">{{ doctor.name }}</span>
          </nav>
        </div>

        <!-- Profile Header -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="bg-white rounded-2xl border border-landing-border shadow-sm overflow-hidden">
            <div class="bg-gradient-to-r from-brand-primary/5 to-brand-primary/10 h-24 lg:h-32"></div>
            <div class="px-6 pb-6 -mt-12 lg:-mt-16">
              <div class="flex flex-col lg:flex-row lg:items-end gap-6">
                <div class="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl border-4 border-white shadow-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <span class="text-3xl lg:text-4xl font-bold text-brand-primary">{{ doctor.name?.replace('Dr. ', '').charAt(0) || '?' }}</span>
                </div>
                <div class="flex-1 min-w-0 pt-4 lg:pt-0">
                  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h1 class="text-xl lg:text-2xl font-bold text-slate-900">{{ doctor.name }}</h1>
                      <p class="text-sm text-brand-primary font-semibold mt-0.5">{{ doctor.specialization }}</p>
                      <div class="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          {{ doctor.experience }} years experience
                        </span>
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                          {{ doctor.facility?.name }}
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <div class="text-center">
                        <div class="text-2xl font-extrabold text-slate-900">{{ doctor.rating }}</div>
                        <div class="flex gap-0.5 mt-0.5">
                          <svg v-for="s in 5" :key="s" class="w-3.5 h-3.5" :class="s <= Math.round(doctor.rating) ? 'text-amber-400' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        </div>
                        <p class="text-xs text-slate-400 mt-0.5">{{ stats.total }} reviews</p>
                      </div>
                      <div class="text-center px-4 border-l border-landing-border">
                        <div class="text-2xl font-extrabold text-brand-primary">${{ doctor.fee }}</div>
                        <p class="text-xs text-slate-400 mt-0.5">Consultation fee</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-6 flex gap-3">
                <button class="px-6 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover shadow-md shadow-brand-primary/20 transition cursor-pointer">Book Appointment</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-10">
              <!-- Gallery -->
              <div v-if="hasGallery">
                <h2 class="text-lg font-bold text-slate-900 mb-4">Gallery</h2>
                <MediaGallery :images="doctor.gallery" aspect-ratio="aspect-video" />
              </div>

              <!-- About -->
              <div>
                <h2 class="text-lg font-bold text-slate-900 mb-3">About</h2>
                <p class="text-sm text-slate-600 leading-relaxed">{{ doctor.about }}</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                  <div class="bg-white rounded-xl border border-landing-border p-4 text-center">
                    <p class="text-lg font-extrabold text-slate-900">{{ doctor.experience }}+</p>
                    <p class="text-xs text-slate-500">Years Experience</p>
                  </div>
                  <div class="bg-white rounded-xl border border-landing-border p-4 text-center">
                    <p class="text-lg font-extrabold text-slate-900">{{ stats.total }}+</p>
                    <p class="text-xs text-slate-500">Patient Reviews</p>
                  </div>
                  <div class="bg-white rounded-xl border border-landing-border p-4 text-center">
                    <p class="text-lg font-extrabold text-brand-primary">${{ doctor.fee }}</p>
                    <p class="text-xs text-slate-500">Consultation Fee</p>
                  </div>
                </div>
              </div>

              <!-- Related Doctors -->
              <div v-if="doctor.related_doctors && doctor.related_doctors.length > 0">
                <h2 class="text-lg font-bold text-slate-900 mb-4">Related Doctors</h2>
                <Swiper :modules="[Pagination]" :pagination="{ clickable: true, dynamicBullets: true }" :space-between="16" :slides-per-view="'auto'" class="pb-8">
                  <SwiperSlide v-for="doc in doctor.related_doctors" :key="doc.id" class="!w-[200px]">
                    <div class="bg-white rounded-xl border border-landing-border p-4 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center">
                        {{ doc.name?.replace('Dr. ', '').charAt(0) || '?' }}
                      </div>
                      <h3 class="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{{ doc.name }}</h3>
                      <p class="text-xs text-slate-500 mb-2 line-clamp-1">{{ doc.specialization }}</p>
                      <div class="flex items-center justify-center gap-1 mb-3">
                        <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= Math.round(doc.rating) ? 'text-amber-400' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </div>
                      <button class="w-full py-2 text-xs font-semibold text-brand-primary border border-brand-primary/40 rounded-lg hover:bg-brand-primary/5 transition cursor-pointer" @click="router.push(`/doctors/${doc.id}`)">View Profile</button>
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>

              <!-- Reviews -->
              <div>
                <h2 class="text-lg font-bold text-slate-900 mb-4">Patient Reviews</h2>
                <ReviewSummary :stats="stats" />
                <div class="mt-6">
                  <ReviewList :reviews="doctor.reviews" :per-page="5" />
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              <div class="bg-white rounded-xl border border-landing-border p-5 shadow-sm">
                <h3 class="text-sm font-bold text-slate-900 mb-4">Booking Info</h3>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                      <p class="text-sm font-semibold text-slate-700">{{ doctor.facility?.name }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                      <p class="text-sm font-semibold text-slate-700">{{ doctor.experience }} years</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee</p>
                      <p class="text-sm font-semibold text-brand-primary">${{ doctor.fee }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-white rounded-xl border border-landing-border p-5 shadow-sm">
                <h3 class="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>
                <div class="space-y-2">
                  <button class="w-full py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-hover transition cursor-pointer">Book Appointment</button>
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
