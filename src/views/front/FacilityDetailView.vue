<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFacilityDetail } from '../../composables/useFacilityDetail'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import { resolveTranslatedValue, getNameInitial } from '../../utils/locale'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()
const { t, locale } = useI18n()

const {
  facility,
  loading,
  notFound,
} = useFacilityDetail(props.id)

const selectedImage = ref(null)

const typeBadge = {
  hospital: 'bg-danger-light text-danger border-danger/30 dark:bg-danger/20 dark:text-danger-light',
  clinic: 'bg-brand-accent-light text-brand-accent border-brand-accent/30 dark:bg-brand-accent/20 dark:text-brand-accent-light',
  pharmacy: 'bg-success-light text-success border-success/30 dark:bg-success/20 dark:text-success-light',
  medical_point: 'bg-warning-light text-warning border-warning/30 dark:bg-warning/20 dark:text-warning-light'
}

const typeGradient = {
  hospital: 'from-slate-900 via-slate-800 to-slate-900',
  clinic: 'from-slate-900 via-slate-800 to-slate-900',
  pharmacy: 'from-slate-900 via-slate-800 to-slate-900',
  medical_point: 'from-slate-900 via-slate-800 to-slate-900'
}

const doctorsCount = computed(() => facility.value?.doctors?.length || 0)
const departmentsCount = computed(() => facility.value?.departments?.length || 0)
const certificatesCount = computed(() => facility.value?.facilityFiles?.length || 0)

const imagesForGallery = computed(() => {
  if (facility.value?.facilityImages?.length) return facility.value.facilityImages
  if (facility.value?.images?.length) return facility.value.images.map(url => ({ url, alt: resolveTranslatedValue(facility.value.name, locale.value), caption: '' }))
  return []
})

const hasGallery = computed(() => imagesForGallery.value.length > 0)

const workingHoursEntries = computed(() => {
  const wh = facility.value?.working_hours
  if (!wh) return []
  return Object.entries(wh).map(([day, hours]) => ({ day, hours }))
})

function initMap() {
  nextTick(async () => {
    const fac = facility.value
    if (!fac?.latitude || !fac?.longitude) return
    try {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')
      const mapEl = document.getElementById('facility-map')
      if (!mapEl) return
      const map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: false }).setView([fac.latitude, fac.longitude], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)
      L.marker([fac.latitude, fac.longitude])
        .addTo(map)
        .bindPopup(`<b>${resolveTranslatedValue(fac.name, locale.value)}</b><br>${fac.location || ''}`)
      setTimeout(() => map.invalidateSize(), 300)
    } catch { /* map not critical */ }
  })
}

watch(() => facility.value, (val) => {
  if (val?.latitude && val?.longitude) initMap()
})
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main>
      <template v-if="loading">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
          <div class="aspect-[21/9] bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
              <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
              <div v-for="n in 3" :key="n" class="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            </div>
            <div class="space-y-4">
              <div class="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              <div class="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="notFound">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div class="w-14 h-14 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('facilityDetail.notFoundTitle') }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">{{ t('facilityDetail.notFoundDesc') }}</p>
          <button
            class="bg-brand-primary text-white rounded-lg px-5 py-2.5 font-semibold shadow-sm hover:bg-brand-primary-hover transition-all cursor-pointer"
            @click="router.push('/facilities')"
          >{{ t('facilityDetail.browseFacilities') }}</button>
        </div>
      </template>

      <template v-else-if="facility">
        <div
          class="relative hero-gradient overflow-hidden pt-28 lg:pt-32 pb-10 lg:pb-14"
        >
          <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
          <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
          <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>

          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav class="flex items-center gap-2 text-sm text-white/60 mb-4" aria-label="Breadcrumb">
              <button class="hover:text-white transition cursor-pointer flex items-center gap-1" @click="router.push('/')">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
                <span class="hidden sm:inline">{{ t('nav.home') }}</span>
              </button>
              <svg class="w-3.5 h-3.5 rtl:rotate-180 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              <button class="hover:text-white transition cursor-pointer" @click="router.push('/facilities')">{{ t('facilitiesListing.pageTitle') }}</button>
              <svg class="w-3.5 h-3.5 rtl:rotate-180 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              <span class="text-white/80 font-medium truncate max-w-[200px]">{{ resolveTranslatedValue(facility.name, locale.value) }}</span>
            </nav>

            <div class="flex flex-wrap items-center gap-3 mb-3">
              <span
                class="rounded-full px-3 py-1 text-xs font-bold border backdrop-blur-md shadow-sm"
                :class="typeBadge[facility.facility_type] || 'bg-white/90 text-slate-700'"
              >{{ facility.facility_type?.replace('_', ' ') }}</span>
              <span class="flex items-center gap-1 text-white/90 text-sm">
                <svg class="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span class="font-bold">{{ facility.rating }}</span>
                <span class="text-white/60">({{ facility.review_count }})</span>
              </span>
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
              {{ resolveTranslatedValue(facility.name, locale.value) }}
            </h1>
            <p class="mt-1.5 text-base sm:text-lg text-white/75 max-w-2xl">
              {{ facility.organization_name }}
            </p>

            <div class="flex flex-wrap gap-x-6 gap-y-1 mt-5 pt-4 border-t border-white/20">
              <div>
                <span class="text-xl font-bold text-white">{{ doctorsCount }}</span>
                <span class="text-xs text-white/70 ml-1.5">{{ t('facilityDetail.quickStats.doctors') }}</span>
              </div>
              <div>
                <span class="text-xl font-bold text-white">{{ departmentsCount }}</span>
                <span class="text-xs text-white/70 ml-1.5">{{ t('facilityDetail.quickStats.departments') }}</span>
              </div>
              <div>
                <span class="text-xl font-bold text-white">{{ certificatesCount }}</span>
                <span class="text-xs text-white/70 ml-1.5">{{ t('facilityDetail.quickStats.certificates') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 mt-8">
          <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-8">

              <section>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-3">{{ t('facilityDetail.about') }}</h2>
                <div class="card-base p-5">
                  <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ resolveTranslatedValue(facility.description, locale.value) }}</p>
                  <div v-if="facility.features?.length" class="mt-4 grid sm:grid-cols-2 gap-2">
                    <div v-for="(f, i) in facility.features" :key="i" class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <svg class="w-4 h-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      {{ f }}
                    </div>
                  </div>
                </div>
              </section>

              <section v-if="facility.doctors?.length">
                <div class="flex items-center gap-2 mb-4">
                  <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('facilityDetail.doctors') }}</h2>
                  <span class="rounded-full px-2.5 py-0.5 text-xs font-bold bg-brand-primary/10 text-brand-primary">{{ doctorsCount }}</span>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="doc in facility.doctors"
                    :key="doc.id"
                    class="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-shadow cursor-pointer"
                    @click="router.push(`/doctors/${doc.id}`)"
                  >
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 flex items-center justify-center text-sm font-bold text-brand-primary shrink-0">
                      {{ getNameInitial(doc.name, locale.value) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ resolveTranslatedValue(doc.name, locale.value) }}</h4>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ resolveTranslatedValue(doc.specialization, locale.value) }}</p>
                    </div>
                    <div class="flex items-center gap-0.5 mr-2">
                      <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= Math.round(doc.rating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    </div>
                    <span class="text-xs font-semibold text-brand-primary hover:underline shrink-0 whitespace-nowrap">
                      {{ t('facilityDetail.viewProfile') }}
                      <svg class="w-3 h-3 inline-block ml-0.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                    </span>
                  </div>
                </div>
              </section>

              <section v-if="facility.facilityFiles?.length">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-3">{{ t('facilityDetail.certificates') }}</h2>
                <div class="space-y-2">
                  <div
                    v-for="file in facility.facilityFiles"
                    :key="file.id"
                    class="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-primary/30 transition-colors"
                  >
                    <div class="w-8 h-8 rounded-lg bg-warning-light dark:bg-warning/20 flex items-center justify-center text-warning dark:text-warning-light shrink-0">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ resolveTranslatedValue(file.name, locale.value) }}</p>
                      <p class="text-xs text-slate-400 dark:text-slate-500 capitalize">{{ file.type }}</p>
                    </div>
                    <button
                      class="shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-brand-primary/10 hover:text-brand-primary flex items-center justify-center text-slate-400 transition cursor-pointer"
                      :title="t('facilityDetail.download')"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                    </button>
                  </div>
                </div>
              </section>

              <section v-if="hasGallery">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-3">{{ t('facilityDetail.gallery') }}</h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div
                    v-for="(img, i) in imagesForGallery"
                    :key="i"
                    class="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer group"
                    @click="selectedImage = i"
                  >
                    <img
                      :src="img.url"
                      :alt="img.alt || resolveTranslatedValue(facility.name, locale.value)"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  </div>
                </div>

                <div
                  v-if="selectedImage !== null"
                  class="fixed inset-0 z-50 bg-black/85 flex items-center justify-center"
                  @click.self="selectedImage = null"
                >
                  <button
                    class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition cursor-pointer z-10"
                    @click="selectedImage = null"
                  >&times;</button>
                  <button
                    v-if="selectedImage > 0"
                    class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl transition cursor-pointer z-10"
                    @click="selectedImage--"
                  >&#8249;</button>
                  <button
                    v-if="selectedImage < imagesForGallery.length - 1"
                    class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl transition cursor-pointer z-10"
                    @click="selectedImage++"
                  >&#8250;</button>
                  <img
                    :src="imagesForGallery[selectedImage]?.url"
                    :alt="imagesForGallery[selectedImage]?.alt || resolveTranslatedValue(facility.name, locale.value)"
                    class="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                  />
                  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                    {{ selectedImage + 1 }} / {{ imagesForGallery.length }}
                  </div>
                </div>
              </section>

              <section v-if="facility.latitude && facility.longitude">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-3">{{ t('facilityDetail.location') }}</h2>
                <div
                  id="facility-map"
                  class="w-full h-[300px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 z-0"
                ></div>
              </section>
            </div>

            <div class="space-y-5">
              <div class="card-base p-4">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3">{{ t('facilityDetail.contactInfo') }}</h3>
                <div class="space-y-3">
                  <div v-if="facility.location" class="flex items-start gap-2.5 text-sm">
                    <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                    <span class="text-slate-600 dark:text-slate-300">{{ facility.location }}</span>
                  </div>
                  <div v-if="facility.phone" class="flex items-start gap-2.5 text-sm">
                    <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                    <a :href="`tel:${facility.phone}`" class="text-brand-primary hover:underline">{{ facility.phone }}</a>
                  </div>
                  <div v-if="facility.email" class="flex items-start gap-2.5 text-sm">
                    <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                    <a :href="`mailto:${facility.email}`" class="text-brand-primary hover:underline break-all">{{ facility.email }}</a>
                  </div>
                  <div v-if="facility.website" class="flex items-start gap-2.5 text-sm">
                    <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg>
                    <a :href="facility.website" target="_blank" rel="noopener noreferrer" class="text-brand-primary hover:underline break-all">{{ facility.website }}</a>
                  </div>
                </div>
              </div>

              <div class="card-base p-4">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3">{{ t('facilityDetail.workingHours') }}</h3>
                <table class="w-full text-sm">
                  <tbody>
                    <tr v-for="entry in workingHoursEntries" :key="entry.day" class="border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <td class="py-1.5 text-slate-600 dark:text-slate-400 capitalize">{{ entry.day.replace('_', ' - ') }}</td>
                      <td class="py-1.5 text-right font-semibold" :class="entry.hours === 'Closed' ? 'text-danger dark:text-danger-light' : 'text-slate-900 dark:text-white'">{{ entry.hours }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="card-base p-4 bg-brand-primary-light dark:bg-brand-primary/10 border-brand-primary/20">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1">{{ t('facilityDetail.bookAppointment') }}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">Schedule a visit with this healthcare facility.</p>
                <button
                  class="btn-primary w-full"
                  @click="$emit('book')"
                >
                  <svg class="w-4 h-4 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z"/></svg>
                  {{ t('facilityDetail.bookAppointment') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>

    <LandingFooter />
  </div>
</template>
