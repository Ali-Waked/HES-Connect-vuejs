<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFacilityDetail } from '../../composables/useFacilityDetail'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import { resolveTranslatedValue, getNameInitial } from '../../utils/locale'
import FavoriteButton from '../../components/favorites/FavoriteButton.vue'
import * as facilityReviewService from '@/services/public/facilityReviewService'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()
const { t, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

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

const doctorsCount = computed(() => facility.value?.doctors?.length || 0)
const filesCount = computed(() => facility.value?.files?.length || 0)
const imagesCount = computed(() => facility.value?.images?.length || 0)

const imagesForGallery = computed(() => {
  if (facility.value?.images?.length) {
    return facility.value.images.map(img => ({
      url: img.image_url || img.url,
      alt: resolveTranslatedValue(facility.value.name),
    }))
  }
  return []
})

const hasGallery = computed(() => imagesForGallery.value.length > 0)

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
        .bindPopup(`<b>${resolveTranslatedValue(fac.name)}</b>`)
      setTimeout(() => map.invalidateSize(), 300)
    } catch { /* map not critical */ }
  })
}

watch(() => facility.value, (val) => {
  if (val?.latitude && val?.longitude) initMap()
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const reviews = ref([])
const reviewsMeta = ref({ current_page: 1, last_page: 1, total: 0 })
const canReview = ref(false)
const reviewsLoading = ref(false)
const reviewRating = ref(0)
const reviewComment = ref('')
const reviewSubmitting = ref(false)
const reviewError = ref('')

async function fetchReviews() {
  reviewsLoading.value = true
  try {
    const { data } = await facilityReviewService.getFacilityReviews(props.id)
    reviews.value = data?.data || []
    reviewsMeta.value = data?.meta || { current_page: 1, last_page: 1, total: 0 }
    canReview.value = data?.can_review ?? false
  } catch {
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

const ratingLabel = computed(() => {
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  return labels[reviewRating.value] || ''
})

async function submitReview() {
  if (!reviewRating.value || reviewSubmitting.value) return
  reviewSubmitting.value = true
  reviewError.value = ''
  try {
    await facilityReviewService.submitFacilityReview(props.id, {
      rating: reviewRating.value,
      comment: reviewComment.value,
    })
    reviewRating.value = 0
    reviewComment.value = ''
    canReview.value = false
    await fetchReviews()
  } catch (err) {
    reviewError.value = err.response?.data?.message || 'Failed to submit review'
  } finally {
    reviewSubmitting.value = false
  }
}

watch(() => facility.value, (val) => {
  if (val) fetchReviews()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans antialiased">
    <AppNavbar variant="landing" />

    <main>
      <!-- Loading State -->
      <template v-if="loading">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
          <div class="aspect-[21/9] bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
          <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
              <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
            </div>
            <div class="space-y-4">
              <div class="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- Not Found State -->
      <template v-else-if="notFound">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div class="w-16 h-16 mx-auto mb-5 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ t('facilityDetail.notFoundTitle') }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">{{ t('facilityDetail.notFoundDesc') }}</p>
          <button class="bg-brand-primary text-white rounded-xl px-6 py-2.5 font-semibold shadow-sm hover:bg-brand-primary-hover transition-all cursor-pointer" @click="router.push('/facilities')">{{ t('facilityDetail.browseFacilities') }}</button>
        </div>
      </template>

      <!-- Facility Content -->
      <template v-else-if="facility">
        <!-- Hero Section -->
        <div class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-28 lg:pt-32 pb-12 lg:pb-16">
          <div v-if="facility.cover_image" class="absolute inset-0">
            <img :src="facility.cover_image" :alt="resolveTranslatedValue(facility.name)" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/75 to-slate-900/85"></div>
          </div>
          <div v-else class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
          <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-primary/10 blur-3xl"></div>
          <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-brand-accent/10 blur-3xl"></div>

          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 text-sm text-white/50 mb-6" aria-label="Breadcrumb">
              <button class="hover:text-white transition cursor-pointer flex items-center gap-1" @click="router.push('/')">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
                <span class="hidden sm:inline">{{ t('nav.home') }}</span>
              </button>
              <svg class="w-3.5 h-3.5 text-white/30" :class="isRtl ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              <button class="hover:text-white transition cursor-pointer" @click="router.push('/facilities')">{{ t('facilitiesListing.pageTitle') }}</button>
              <svg class="w-3.5 h-3.5 text-white/30" :class="isRtl ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              <span class="text-white/70 font-medium truncate max-w-[200px]">{{ resolveTranslatedValue(facility.name) }}</span>
            </nav>

            <!-- Title Area -->
            <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div class="space-y-4">
                <div class="flex flex-wrap items-center gap-2.5">
                  <span class="rounded-full px-3 py-1 text-xs font-bold border backdrop-blur-md shadow-sm" :class="typeBadge[facility.facility_type] || 'bg-white/90 text-slate-700'">{{ facility.facility_type?.replace('_', ' ') }}</span>
                  <span v-if="facility.organization" class="flex items-center gap-1.5 text-white/60 text-sm">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg>
                    {{ resolveTranslatedValue(facility.organization.name) }}
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">{{ resolveTranslatedValue(facility.name) }}</h1>
                  <FavoriteButton :favoritable-id="facility.uuid || facility.id" favoritable-type="facility" :is-favorited="facility?.is_favorited" size="lg" />
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="flex gap-6 lg:gap-8">
                <div class="text-center">
                  <span class="block text-2xl font-black text-white">{{ doctorsCount }}</span>
                  <span class="text-xs text-white/50 font-medium">{{ t('facilityDetail.quickStats.doctors') }}</span>
                </div>
                <div class="w-px bg-white/10"></div>
                <div class="text-center">
                  <span class="block text-2xl font-black text-white">{{ filesCount }}</span>
                  <span class="text-xs text-white/50 font-medium">{{ t('facilityDetail.quickStats.certificates') }}</span>
                </div>
                <div class="w-px bg-white/10"></div>
                <div class="text-center">
                  <span class="block text-2xl font-black text-white">{{ imagesCount }}</span>
                  <span class="text-xs text-white/50 font-medium">{{ t('facilityDetail.quickStats.documents') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-6">
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Left Column -->
            <div class="lg:col-span-2 space-y-8">

              <!-- About -->
              <section v-if="resolveTranslatedValue(facility.description)" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>
                  {{ t('facilityDetail.about') }}
                </h2>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{{ resolveTranslatedValue(facility.description) }}</p>
              </section>

              <!-- Doctors -->
              <section v-if="facility.doctors?.length" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div class="flex items-center justify-between mb-5">
                  <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                    {{ t('facilityDetail.doctors') }}
                  </h2>
                  <span class="rounded-full px-2.5 py-0.5 text-xs font-bold bg-brand-primary/10 text-brand-primary">{{ doctorsCount }}</span>
                </div>
                <div class="grid sm:grid-cols-2 gap-3">
                  <div
                    v-for="doc in facility.doctors"
                    :key="doc.uuid"
                    class="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-brand-primary/30 hover:shadow-sm transition-all cursor-pointer group"
                    @click="router.push(`/doctors/${doc.uuid}`)"
                  >
                    <div class="w-11 h-11 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-sm font-bold text-brand-primary shrink-0 ring-2 ring-white dark:ring-slate-800">
                      {{ getNameInitial(doc.name) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{{ resolveTranslatedValue(doc.name) }}</h4>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ resolveTranslatedValue(doc.specialization?.name || doc.specialization) }}</p>
                    </div>
                    <svg class="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" :class="isRtl ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                  </div>
                </div>
              </section>

              <!-- Certificates -->
              <section v-if="facility.files?.length" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                  {{ t('facilityDetail.certificates') }}
                </h2>
                <div class="grid sm:grid-cols-2 gap-3">
                  <a
                    v-for="file in facility.files"
                    :key="file.id"
                    :href="file.file_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-brand-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div class="w-10 h-10 rounded-xl bg-warning-light dark:bg-warning/20 flex items-center justify-center text-warning dark:text-warning-light shrink-0">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors capitalize">{{ file.document_type?.replace(/_/g, ' ') }}</p>
                    </div>
                    <svg class="w-4 h-4 text-slate-400 group-hover:text-brand-primary shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                  </a>
                </div>
              </section>

              <!-- Gallery -->
              <section v-if="hasGallery" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v12A2.25 2.25 0 003.75 21z"/></svg>
                  {{ t('facilityDetail.gallery') }}
                </h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div
                    v-for="(img, i) in imagesForGallery"
                    :key="i"
                    class="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer group relative"
                    @click="selectedImage = i"
                  >
                    <img :src="img.url" :alt="img.alt" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  </div>
                </div>

                <!-- Lightbox -->
                <Teleport to="body">
                  <div v-if="selectedImage !== null" class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center" @click.self="selectedImage = null">
                    <button class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer z-10" @click="selectedImage = null">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                    <button v-if="selectedImage > 0" class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer z-10" @click="selectedImage--">
                      <svg class="w-6 h-6" :class="isRtl ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
                    </button>
                    <button v-if="selectedImage < imagesForGallery.length - 1" class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer z-10" @click="selectedImage++">
                      <svg class="w-6 h-6" :class="isRtl ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                    </button>
                    <img :src="imagesForGallery[selectedImage]?.url" :alt="imagesForGallery[selectedImage]?.alt" class="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl" />
                    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-medium px-4 py-1.5 rounded-full backdrop-blur-sm">
                      {{ selectedImage + 1 }} / {{ imagesForGallery.length }}
                    </div>
                  </div>
                </Teleport>
              </section>

              <!-- Map -->
              <section v-if="facility.latitude && facility.longitude" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                  {{ t('facilityDetail.location') }}
                </h2>
                <div id="facility-map" class="w-full h-[320px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"></div>
              </section>

              <!-- Reviews -->
              <section class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div class="flex items-center justify-between mb-5">
                  <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg class="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>
                    {{ t('reviews.title') }}
                  </h2>
                  <span v-if="!reviewsLoading" class="rounded-full px-2.5 py-0.5 text-xs font-bold bg-brand-primary/10 text-brand-primary">{{ reviewsMeta.total }}</span>
                </div>

                <!-- Review Form -->
                <div v-if="canReview" class="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-5 mb-6 border border-slate-100 dark:border-slate-700/50">
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4">{{ t('reviews.writeReview') || 'Write a Review' }}</h3>
                  <div class="flex items-center gap-1 mb-3">
                    <button v-for="s in 5" :key="s" type="button" class="cursor-pointer transition-transform hover:scale-110" @click="reviewRating = s">
                      <svg class="w-8 h-8" :class="s <= reviewRating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    </button>
                    <span v-if="reviewRating" class="ml-2 text-xs text-slate-500 dark:text-slate-400 font-medium">{{ ratingLabel }}</span>
                  </div>
                  <textarea
                    v-model="reviewComment"
                    rows="3"
                    :placeholder="t('reviews.writePlaceholder') || 'Share your experience with this facility...'"
                    class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition resize-none mb-3"
                  />
                  <p v-if="reviewError" class="text-sm text-red-500 dark:text-red-400 mb-3">{{ reviewError }}</p>
                  <button class="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover transition cursor-pointer disabled:opacity-50 shadow-sm" :disabled="!reviewRating || reviewSubmitting" @click="submitReview">
                    {{ reviewSubmitting ? (t('common.submitting') || 'Submitting...') : (t('common.submit') || 'Submit') }}
                  </button>
                </div>

                <!-- Reviews Loading -->
                <div v-if="reviewsLoading" class="space-y-3">
                  <div v-for="n in 3" :key="n" class="p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 animate-pulse">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      <div class="flex-1 space-y-1.5">
                        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                        <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                      </div>
                    </div>
                    <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  </div>
                </div>

                <!-- No Reviews -->
                <div v-else-if="reviews.length === 0" class="py-12 text-center">
                  <div class="w-14 h-14 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                    <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>
                  </div>
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ t('reviews.noReviews') || 'No reviews yet.' }}</p>
                </div>

                <!-- Reviews List -->
                <div v-else class="space-y-4">
                  <div v-for="review in reviews" :key="review.id" class="p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div class="flex items-start gap-3">
                      <div class="shrink-0">
                        <img v-if="review.patient?.avatar" :src="review.patient.avatar" :alt="resolveTranslatedValue(review.patient.name)" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" />
                        <div v-else class="w-10 h-10 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-sm font-bold text-brand-primary">
                          {{ getNameInitial(review.patient?.name) }}
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2">
                          <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ resolveTranslatedValue(review.patient?.name) }}</h4>
                          <span class="text-xs text-slate-400 dark:text-slate-500 shrink-0">{{ formatDate(review.created_at) }}</span>
                        </div>
                        <div class="flex items-center gap-0.5 mt-1">
                          <svg v-for="s in 5" :key="s" class="w-3.5 h-3.5" :class="s <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </div>
                        <p v-if="review.comment" class="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{{ review.comment }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Reviews Pagination -->
                <div v-if="reviewsMeta.last_page > 1 && !reviewsLoading" class="mt-6 flex justify-center">
                  <nav class="flex items-center gap-1.5">
                    <button class="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs transition cursor-pointer bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand-primary/10 hover:border-brand-primary/30 hover:text-brand-primary" :disabled="reviewsMeta.current_page <= 1" @click="fetchReviews">
                      <svg class="w-4 h-4" :class="isRtl ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
                    </button>
                    <span class="text-xs text-slate-500 dark:text-slate-400 px-3 font-medium">{{ reviewsMeta.current_page }} / {{ reviewsMeta.last_page }}</span>
                    <button class="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs transition cursor-pointer bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand-primary/10 hover:border-brand-primary/30 hover:text-brand-primary" :disabled="reviewsMeta.current_page >= reviewsMeta.last_page" @click="fetchReviews">
                      <svg class="w-4 h-4" :class="isRtl ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                    </button>
                  </nav>
                </div>
              </section>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              <!-- Contact Info -->
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm sticky top-24">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.813a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.25 8.5"/></svg>
                  {{ t('facilityDetail.contactInfo') }}
                </h3>
                <div class="space-y-4">
                  <div v-if="facility.organization" class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <svg class="w-4.5 h-4.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg>
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('facilityDetail.organization') || 'Organization' }}</p>
                      <p class="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{{ resolveTranslatedValue(facility.organization.name) }}</p>
                    </div>
                  </div>
                  <div v-if="facility.head_staff" class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <svg class="w-4.5 h-4.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('facilitiesListing.headDoctor') }}</p>
                      <p class="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{{ resolveTranslatedValue(facility.head_staff.name) }}</p>
                      <p v-if="facility.head_staff.specialization" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ resolveTranslatedValue(facility.head_staff.specialization?.name || facility.head_staff.specialization) }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <svg class="w-4.5 h-4.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('facilityDetail.coordinates') || 'Coordinates' }}</p>
                      <p class="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{{ Number(facility.latitude).toFixed(4) }}, {{ Number(facility.longitude).toFixed(4) }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <svg class="w-4.5 h-4.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('facilityDetail.updatedAt') }}</p>
                      <p class="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{{ formatDate(facility.updated_at || facility.created_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Book Appointment CTA -->
              <div class="bg-gradient-to-br from-brand-primary to-brand-primary-hover rounded-2xl p-6 text-white shadow-lg shadow-brand-primary/20">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                </div>
                <h3 class="text-base font-bold mb-1">{{ t('facilityDetail.bookAppointment') }}</h3>
                <p class="text-sm text-white/70 mb-5">Schedule a visit with this healthcare facility.</p>
                <button class="w-full py-3 bg-white text-brand-primary text-sm font-bold rounded-xl hover:bg-white/90 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z"/></svg>
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
