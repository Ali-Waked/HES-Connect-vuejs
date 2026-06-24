<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useDoctorDetail } from '../../composables/useDoctorDetail'
import { findOrCreateConversation } from '@/services/chatService'
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import BookAppointmentModal from '../../components/staff/modals/BookAppointmentModal.vue'
import { resolveTranslatedValue, getNameInitial } from '../../utils/locale'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()
const { t, locale } = useI18n()
const auth = useAuthStore()

const { doctor, loading, error, notFound, fetchDoctor } = useDoctorDetail(props.id)

const typeBadge = {
  hospital: 'bg-danger-light text-danger dark:bg-danger/20 dark:text-danger-light',
  clinic: 'bg-brand-accent-light text-brand-accent dark:bg-brand-accent/20 dark:text-brand-accent-light',
  pharmacy: 'bg-success-light text-success dark:bg-success/20 dark:text-success-light',
  medical_point: 'bg-warning-light text-warning dark:bg-warning/20 dark:text-warning-light',
}

const hasFacilities = computed(() => (doctor.value?.facilities?.length || 0) > 0)
const hasRelated = computed(() => (doctor.value?.related_doctors?.length || 0) > 0)
const bookModal = ref(false)
const chatLoading = ref(false)

async function initMap() {
  await nextTick()
  const facs = doctor.value?.facilities
  if (!facs?.length) return
  const mapEl = document.getElementById('doctor-map')
  if (!mapEl) return
  try {
    const L = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    const map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: false }).setView([facs[0].latitude, facs[0].longitude], 9)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    facs.forEach(f => {
      if (f.latitude && f.longitude) {
        L.marker([f.latitude, f.longitude])
          .addTo(map)
          .bindPopup(`<b>${resolveTranslatedValue(f.name, locale.value)}</b><br>${f.city || ''}`)
      }
    })
    if (facs.length > 1) {
      const bounds = facs.filter(f => f.latitude && f.longitude).map(f => [f.latitude, f.longitude])
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [50, 50] })
    }
    setTimeout(() => map.invalidateSize(), 300)
  } catch { /* map not critical */ }
}

function goToBook() {
  if (auth.authenticated) {
    bookModal.value = true
  } else {
    router.push({ name: 'login', query: { redirect: `/doctors/${props.id}` } })
  }
}

async function openChat() {
  if (!auth.authenticated) {
    router.push({ name: 'login', query: { redirect: `/doctors/${props.id}` } })
    return
  }
  if (chatLoading.value) return
  chatLoading.value = true
  try {
    const doctorUserUuid = doctor.value?.user?.uuid || doctor.value?.user_uuid
    if (!doctorUserUuid) return
    const { data } = await findOrCreateConversation({
      type: 'doctor_patient',
      participant_ids: [doctorUserUuid]
    })
    const conv = data.data || data
    router.push(`/conversations/${conv.id}`)
  } catch (err) {
    console.error(err)
  } finally {
    chatLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900 font-sans antialiased text-slate-900 dark:text-slate-100">
    <!-- <AppNavbar variant="landing" /> -->

    <main>
      <template v-if="loading">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16 space-y-6">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
          <div class="flex flex-col lg:flex-row gap-8">
            <div class="lg:flex-1 space-y-6">
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div class="p-6 sm:p-8">
                  <div class="flex flex-col sm:flex-row gap-6">
                    <div class="w-28 h-28 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0"></div>
                    <div class="flex-1 space-y-3">
                      <div class="h-7 bg-slate-200 dark:bg-slate-700 rounded w-56 animate-pulse"></div>
                      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-36 animate-pulse"></div>
                      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse"></div>
                      <div class="flex gap-3 mt-4">
                        <div class="h-11 bg-slate-200 dark:bg-slate-700 rounded-lg w-36 animate-pulse"></div>
                        <div class="h-11 bg-slate-200 dark:bg-slate-700 rounded-lg w-36 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-for="n in 3" :key="n" class="h-40 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 animate-pulse"></div>
            </div>
            <div class="lg:w-80 space-y-6">
              <div class="h-52 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 animate-pulse"></div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="notFound">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{{ t('doctorDetail.notFoundTitle') }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">{{ t('doctorDetail.notFoundDesc') }}</p>
          <button
            class="px-6 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover shadow-sm transition cursor-pointer"
            @click="router.push('/doctors')"
          >{{ t('doctorDetail.browseDoctors') }}</button>
        </div>
      </template>

      <template v-else-if="doctor">
        <div class="relative hero-gradient overflow-hidden">
          <div class="hero-grid-pattern absolute inset-0 opacity-50"></div>
          <div class="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl"></div>
          <div class="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-28 lg:pb-32">
            <nav class="flex items-center gap-2 text-sm text-white/60 mb-5" aria-label="Breadcrumb">
              <button class="hover:text-white transition cursor-pointer" @click="router.push('/')">
                <svg class="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
                <span class="hidden sm:inline ml-1">{{ t('nav.home') }}</span>
              </button>
              <svg class="w-3.5 h-3.5 rtl:rotate-180 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              <button class="hover:text-white transition cursor-pointer" @click="router.push('/doctors')">{{ t('doctorsListing.pageTitle') }}</button>
              <svg class="w-3.5 h-3.5 rtl:rotate-180 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              <span class="text-white/80 font-medium truncate max-w-[200px]">{{ resolveTranslatedValue(doctor.name, locale.value) }}</span>
            </nav>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">{{ resolveTranslatedValue(doctor.name, locale.value) }}</h1>
            <p class="mt-2 text-lg text-white/75">{{ resolveTranslatedValue(doctor.specialization, locale.value) }}</p>
          </div>
          <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-surface-secondary dark:from-slate-900 to-transparent"></div>
        </div>

        <section class="relative z-10 -mt-16 pb-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card overflow-hidden">
              <div class="p-6 sm:p-8">
                <div class="flex flex-col sm:flex-row gap-6">
                  <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-xl shrink-0 overflow-hidden bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-slate-800 -mt-16 sm:-mt-20">
                    <img
                      v-if="doctor.profile_image"
                      :src="doctor.profile_image"
                      :alt="resolveTranslatedValue(doctor.name, locale.value)"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-4xl sm:text-5xl font-bold text-white">{{ getNameInitial(doctor.name, locale.value) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div class="min-w-0">
                        <div class="flex items-center gap-3 flex-wrap">
                          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">{{ resolveTranslatedValue(doctor.name, locale.value) }}</h1>
                          <span v-if="doctor.is_medical_director" class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-warning-light dark:bg-warning/20 text-warning dark:text-warning-light rounded-lg text-[10px] font-bold shrink-0">{{ t('doctorDetail.headDoctorBadge') }}</span>
                        </div>
                        <p class="text-base font-semibold text-brand-primary mt-1">{{ resolveTranslatedValue(doctor.specialization, locale.value) }}</p>
                        <div class="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                          <span class="flex items-center gap-1">
                            <svg class="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            <span class="font-bold text-amber-500">{{ doctor.rating }}</span>
                            <span class="text-slate-400 dark:text-slate-500">({{ doctor.reviews?.length || 0 }})</span>
                          </span>
                          <span class="text-slate-300 dark:text-slate-600">·</span>
                          <span>{{ t('doctorDetail.yearsExperience', { years: doctor.experience }) }}</span>
                        </div>
                      </div>
                      <div class="flex-shrink-0">
                        <div class="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <span class="text-lg font-extrabold text-brand-primary">${{ doctor.fee }}</span>
                          <span class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">{{ t('doctorDetail.consultationFee') }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
                      <button class="btn-primary" @click="goToBook">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z"/></svg>
                        {{ t('doctorDetail.bookAppointment') }}
                      </button>
                       <button class="btn-secondary" @click="openChat" :disabled="chatLoading">
                        <span v-if="chatLoading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                        {{ chatLoading ? 'Opening...' : t('doctorDetail.chatWithDoctor') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
          <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-card overflow-hidden grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700">
            <div class="py-4 px-3 text-center">
              <p class="text-lg font-extrabold text-slate-900 dark:text-white">{{ doctor.experience }}+</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('doctorDetail.yearsExperience', { years: '' }).trim() || 'Years' }}</p>
            </div>
            <div class="py-4 px-3 text-center">
              <p class="text-lg font-extrabold text-slate-900 dark:text-white">{{ doctor.facilities?.length || 0 }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('doctorDetail.facilities') }}</p>
            </div>
            <div class="py-4 px-3 text-center">
              <p class="text-lg font-extrabold text-slate-900 dark:text-white">{{ doctor.qualifications?.length || 0 }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('doctorDetail.qualifications') }}</p>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 mt-8">
          <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-10">
              <section>
                <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{{ t('doctorDetail.biography') }}</h2>
                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ doctor.about }}</p>
              </section>

              <section v-if="doctor.qualifications?.length">
                <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">{{ t('doctorDetail.qualifications') }}</h2>
                <div class="relative">
                  <div class="absolute left-[11px] top-2 bottom-2 w-0.5 bg-success/20 dark:bg-success/30"></div>
                  <ul class="space-y-4">
                    <li v-for="(q, i) in doctor.qualifications" :key="i" class="flex items-start gap-4 relative">
                      <div class="relative z-10 w-6 h-6 rounded-full bg-success-light dark:bg-success/20 border-2 border-success flex items-center justify-center shrink-0 mt-0.5">
                        <svg class="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      </div>
                      <span class="text-sm text-slate-600 dark:text-slate-300 pt-0.5">{{ q }}</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section v-if="hasFacilities">
                <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">{{ t('doctorDetail.facilities') }}</h2>
                <div class="space-y-2">
                  <div
                    v-for="fac in doctor.facilities"
                    :key="fac.id"
                    class="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:shadow-sm transition cursor-pointer"
                    @click="router.push(`/facilities/${fac.id}`)"
                  >
                    <div class="w-12 h-12 rounded-lg shrink-0 bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                      <img
                        v-if="fac.image"
                        :src="fac.image"
                        :alt="resolveTranslatedValue(fac.name, locale.value)"
                        class="w-full h-full object-cover"
                      />
                      <svg v-else class="w-6 h-6 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-bold capitalize"
                          :class="typeBadge[fac.facility_type] || 'bg-slate-100 text-slate-600'"
                        >{{ fac.facility_type?.replace('_', ' ') }}</span>
                        <span v-if="doctor.head_facilities?.some(hf => hf.id === fac.id)" class="px-1.5 py-0.5 bg-warning-light dark:bg-warning/20 text-warning dark:text-warning-light rounded text-[10px] font-bold">{{ t('doctorDetail.headDoctorBadge') }}</span>
                      </div>
                      <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ resolveTranslatedValue(fac.name, locale.value) }}</h3>
                      <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ fac.organization_name }}</p>
                    </div>
                    <div class="text-xs text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block">
                      <span class="font-medium text-slate-700 dark:text-slate-300 block">{{ resolveTranslatedValue(fac.position, locale.value) }}</span>
                      <span v-if="fac.departments?.length" class="text-[10px]">{{ fac.departments.map(d => resolveTranslatedValue(d.name, locale.value)).join(', ') }}</span>
                    </div>
                    <svg class="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                  </div>
                </div>
              </section>

              <section v-if="hasFacilities">
                <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">{{ t('doctorDetail.mapTitle') }}</h2>
                <div
                  id="doctor-map"
                  class="w-full h-[300px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm z-0"
                ></div>
              </section>
            </div>

            <div class="space-y-6">
              <div class="card-base p-5">
                <h3 class="text-sm font-extrabold text-slate-900 dark:text-white mb-4">{{ t('doctorDetail.about') }}</h3>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <div class="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('doctorDetail.specialization') }}</p>
                      <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ resolveTranslatedValue(doctor.specialization, locale.value) }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('doctorDetail.experience') }}</p>
                      <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('doctorDetail.yearsExperience', { years: doctor.experience }) }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('doctorDetail.consultationFee') }}</p>
                      <p class="text-sm font-semibold text-brand-primary">${{ doctor.fee }}</p>
                    </div>
                  </div>
                  <div v-if="doctor.departments?.length" class="flex items-start gap-3">
                    <div class="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M3.75 6h16.5M3.75 12h16.5m-16.5 6h16.5"/></svg>
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('doctorsListing.departments') }}</p>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span v-for="dept in doctor.departments" :key="dept.id" class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold">{{ resolveTranslatedValue(dept.name, locale.value) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-base p-5 bg-brand-primary-light dark:bg-brand-primary/10 border-brand-primary/20">
                <h3 class="text-sm font-extrabold text-slate-900 dark:text-white mb-1">{{ t('doctorDetail.bookAppointment') }}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">{{ t('doctorDetail.consultationFee') }}: ${{ doctor.fee }}</p>
                <button class="btn-primary w-full" @click="goToBook">{{ t('doctorDetail.bookAppointment') }}</button>
                <button class="btn-secondary w-full mt-2" @click="openChat" :disabled="chatLoading">
                  <span v-if="chatLoading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  {{ chatLoading ? 'Opening...' : t('doctorDetail.chatWithDoctor') }}
                </button>
              </div>
            </div>
          </div>

          <section v-if="hasRelated" class="mt-12">
            <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">{{ t('doctorDetail.relatedDoctors') }}</h2>
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                v-for="doc in doctor.related_doctors"
                :key="doc.id"
                class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                @click="router.push(`/doctors/${doc.id}`)"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-lg shrink-0 overflow-hidden bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center">
                    <img
                      v-if="doc.profile_image"
                      :src="doc.profile_image"
                      :alt="resolveTranslatedValue(doc.name, locale.value)"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-sm font-bold text-white">{{ getNameInitial(doc.name, locale.value) }}</span>
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors truncate">{{ resolveTranslatedValue(doc.name, locale.value) }}</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ resolveTranslatedValue(doc.specialization, locale.value) }}</p>
                  </div>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">{{ resolveTranslatedValue(doc.about || doc.bio, locale.value) }}</p>
                <div class="flex items-center justify-between text-xs">
                  <span class="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                    <svg class="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    {{ doc.rating }}
                  </span>
                  <span class="font-semibold text-brand-primary">{{ resolveTranslatedValue(doc.position, locale.value) }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="mt-12">
            <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">{{ t('doctorDetail.reviews') }}</h2>
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
              <svg class="w-12 h-12 mx-auto text-slate-200 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/></svg>
              <h3 class="text-base font-semibold text-slate-600 dark:text-slate-400">{{ t('doctorDetail.noReviews') }}</h3>
              <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">{{ t('doctorDetail.noReviewsDesc') }}</p>
            </div>
          </section>
        </div>
      </template>
    </main>

    <LandingFooter />

    <BookAppointmentModal :show="bookModal" :staff-uuid="props.id" @close="bookModal = false" @booked="bookModal = false" />
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
