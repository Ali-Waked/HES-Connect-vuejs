<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { getDoctorDetail } from '@/services/public/doctorService'
import { resolveTranslatedValue, getNameInitial } from '@/utils/locale'
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import DoctorFacilities from '@/components/public/doctors/DoctorFacilities.vue'
import DoctorDepartments from '@/components/public/doctors/DoctorDepartments.vue'
import BookAppointmentModal from '@/components/staff/modals/BookAppointmentModal.vue'
import ChatSidebar from '@/components/public/ChatSidebar.vue'

const props = defineProps({ uuid: { type: String, default: '' } })

const router = useRouter()
const { t, locale } = useI18n()
const auth = useAuthStore()

const doctor = ref(null)
const loading = ref(true)
const error = ref(null)
const notFound = ref(false)

const hasHeadFacilities = ref(false)
const showAvatarPreview = ref(false)
const bookModal = ref(false)
const chatSidebarVisible = ref(false)
const avatarSrc = computed(() => doctor.value?.avatar || doctor.value?.profile_image || null)

async function fetchDoctor() {
  if (!props.uuid) {
    notFound.value = true
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
  notFound.value = false
  try {
    const { data } = await getDoctorDetail(props.uuid)
    const doctorData = data?.data || data
    if (!doctorData) {
      notFound.value = true
      return
    }
    doctor.value = doctorData
    hasHeadFacilities.value = (doctorData.head_facilities?.length || 0) > 0
  } catch (err) {
    if (err.response?.status === 404) {
      notFound.value = true
    } else {
      error.value = err.response?.data?.message || 'Failed to load doctor'
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchDoctor)

function goToBook() {
  if (auth.authenticated) {
    bookModal.value = true
  } else {
    router.push({ name: 'login', query: { redirect: `/doctors/${props.uuid}` } })
  }
}

function openChat() {
  if (!auth.authenticated) {
    router.push({ name: 'login', query: { redirect: `/doctors/${props.uuid}` } })
    return
  }
  chatSidebarVisible.value = true
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans antialiased text-slate-900 dark:text-slate-100">
    <AppNavbar variant="landing" />

    <main>
      <!-- Loading -->
      <template v-if="loading">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse mb-8"></div>
          <div class="flex flex-col lg:flex-row gap-8">
            <div class="lg:flex-1 space-y-6">
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden p-6 sm:p-8">
                <div class="flex flex-col sm:flex-row gap-6">
                  <div class="w-28 h-28 rounded-2xl bg-slate-100 dark:bg-slate-700 animate-pulse shrink-0"></div>
                  <div class="flex-1 space-y-3">
                    <div class="h-7 bg-slate-100 dark:bg-slate-700 rounded w-56 animate-pulse"></div>
                    <div class="h-4 bg-slate-100 dark:bg-slate-700 rounded w-36 animate-pulse"></div>
                    <div class="h-4 bg-slate-100 dark:bg-slate-700 rounded w-64 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div v-for="n in 3" :key="n" class="h-40 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse"></div>
            </div>
            <div class="lg:w-80 space-y-6">
              <div class="h-52 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- Not Found -->
      <template v-else-if="notFound">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl text-slate-400">person_off</span>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{{ t('doctorDetail.notFoundTitle') }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">{{ t('doctorDetail.notFoundDesc') }}</p>
          <button class="px-6 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover shadow-sm transition cursor-pointer" @click="router.push('/doctors')">
            {{ t('doctorDetail.browseDoctors') }}
          </button>
        </div>
      </template>

      <!-- Error -->
      <template v-else-if="error">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl text-rose-400">error_outline</span>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{{ t('common.error') }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">{{ error }}</p>
          <button class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover transition cursor-pointer" @click="fetchDoctor">
            <span class="material-symbols-outlined text-base">refresh</span> {{ t('common.retry') }}
          </button>
        </div>
      </template>

      <!-- Doctor Content -->
      <template v-else-if="doctor">
        <!-- Hero Section -->
        <div class="relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary-dark to-slate-900"></div>
          <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.4&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"></div>
          <div v-if="doctor.cover_image" class="absolute inset-0">
            <img :src="doctor.cover_image" :alt="resolveTranslatedValue(doctor.name, locale.value)" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          </div>

          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-12">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 text-sm text-white/50 mb-8" aria-label="Breadcrumb">
              <button class="hover:text-white transition cursor-pointer" @click="router.push('/')">
                <span class="material-symbols-outlined text-lg">home</span>
              </button>
              <span class="material-symbols-outlined text-sm text-white/30">chevron_right</span>
              <button class="hover:text-white transition cursor-pointer" @click="router.push('/doctors')">{{ t('doctorsListing.pageTitle') }}</button>
              <span class="material-symbols-outlined text-sm text-white/30">chevron_right</span>
              <span class="text-white/80 font-medium truncate max-w-[200px]">{{ resolveTranslatedValue(doctor.name, locale.value) }}</span>
            </nav>

            <!-- Doctor Info -->
            <div class="flex flex-col sm:flex-row items-start gap-6">
              <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shrink-0 overflow-hidden bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm flex items-center justify-center shadow-2xl ring-4 ring-white/20 cursor-pointer" @click="showAvatarPreview = true">
                <img v-if="avatarSrc" :src="avatarSrc" :alt="resolveTranslatedValue(doctor.name, locale.value)" class="w-full h-full object-cover" />
                <span v-else class="text-4xl sm:text-5xl font-bold text-white">{{ getNameInitial(doctor.name, locale.value) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{{ resolveTranslatedValue(doctor.name, locale.value) }}</h1>
                  <span v-if="doctor.is_head_doctor" class="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400/20 text-amber-300 rounded-lg text-xs font-bold shrink-0 backdrop-blur-sm">
                    <span class="material-symbols-outlined text-sm">workspace_premium</span>
                    {{ t('doctorDetail.headDoctorBadge') }}
                  </span>
                </div>
                <p class="text-lg text-white/80 font-semibold mt-1">{{ resolveTranslatedValue(doctor.specialization, locale.value) }}</p>
                <div class="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/60">
                  <span v-if="doctor.city" class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-base">location_on</span>
                    {{ doctor.city }}
                  </span>
                  <span v-if="doctor.gender" class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-base">person</span>
                    {{ doctor.gender === 'male' ? t('gender.male') : t('gender.female') }}
                  </span>
                  <span v-if="doctor.rating" class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-base">star</span>
                    <span class="text-amber-400 font-bold">{{ doctor.rating }}</span>
                    <span>({{ doctor.reviews_count || doctor.reviews?.length || 0 }})</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <section class="relative z-10 -mt-6 pb-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid lg:grid-cols-3 gap-8">
              <!-- Main Content -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Bio -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 sm:p-8">
                  <div class="flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-brand-primary text-lg">person</span>
                    <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('doctorDetail.biography') }}</h2>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ resolveTranslatedValue(doctor.bio, locale.value) || t('common.noData') }}</p>
                </div>

                <!-- Facilities -->
                <div v-if="doctor.facilities?.length" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 sm:p-8">
                  <div class="flex items-center gap-2 mb-5">
                    <span class="material-symbols-outlined text-brand-primary text-lg">local_hospital</span>
                    <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('doctorDetail.facilities') }}</h2>
                    <span class="ml-auto inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400">{{ doctor.facilities.length }}</span>
                  </div>
                  <DoctorFacilities :facilities="doctor.facilities" />
                </div>

                <!-- Departments -->
                <div v-if="doctor.departments?.length" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 sm:p-8">
                  <div class="flex items-center gap-2 mb-5">
                    <span class="material-symbols-outlined text-brand-primary text-lg">category</span>
                    <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('doctorDetail.departments') }}</h2>
                  </div>
                  <DoctorDepartments :departments="doctor.departments" />
                </div>

                <!-- Head Facilities -->
                <div v-if="hasHeadFacilities" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 sm:p-8">
                  <div class="flex items-center gap-2 mb-5">
                    <span class="material-symbols-outlined text-amber-500 text-lg">workspace_premium</span>
                    <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('doctorDetail.headFacilities') }}</h2>
                  </div>
                  <DoctorFacilities :facilities="doctor.head_facilities" />
                </div>

                <!-- Reviews -->
                <div v-if="doctor.reviews?.length" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 sm:p-8">
                  <div class="flex items-center gap-2 mb-5">
                    <span class="material-symbols-outlined text-brand-primary text-lg">reviews</span>
                    <h2 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ t('doctorDetail.reviews') }}</h2>
                    <span class="ml-auto inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400">{{ doctor.reviews.length }}</span>
                  </div>
                  <div class="space-y-4">
                    <div v-for="review in doctor.reviews.slice(0, 5)" :key="review.id || review.uuid" class="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0">
                          <span class="text-xs font-bold text-brand-primary">{{ (review.user?.name || 'A').charAt(0).toUpperCase() }}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ review.user?.name || 'Anonymous' }}</p>
                          <div class="flex items-center gap-1">
                            <template v-for="s in 5" :key="s">
                              <span class="material-symbols-outlined text-xs" :class="s <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'">star</span>
                            </template>
                          </div>
                        </div>
                      </div>
                      <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ review.comment || review.content }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sidebar -->
              <div class="space-y-6">
                <!-- Quick Info -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
                  <h3 class="text-sm font-extrabold text-slate-900 dark:text-white mb-4">{{ t('doctorDetail.about') }}</h3>
                  <div class="space-y-4">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-brand-primary text-sm">medical_services</span>
                      </div>
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('doctorDetail.specialization') }}</p>
                        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ resolveTranslatedValue(doctor.specialization, locale.value) }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-brand-primary text-sm">location_on</span>
                      </div>
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('doctorDetail.city') }}</p>
                        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ doctor.city || t('common.notSpecified') }}</p>
                      </div>
                    </div>
                    <div v-if="doctor.gender" class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-brand-primary text-sm">person</span>
                      </div>
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('doctorDetail.gender') }}</p>
                        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ doctor.gender === 'male' ? t('gender.male') : t('gender.female') }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Book Card -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div class="bg-gradient-to-br from-brand-primary to-brand-primary-dark p-5">
                    <h3 class="text-sm font-extrabold text-white mb-1">{{ t('doctorDetail.bookAppointment') }}</h3>
                    <p class="text-xs text-white/70">Send a message to this doctor</p>
                  </div>
                  <div class="p-5 space-y-3">
                    <button class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-primary-hover shadow-sm hover:shadow-md transition-all cursor-pointer" @click="goToBook">
                      <span class="material-symbols-outlined text-base">calendar_month</span>
                      {{ t('doctorDetail.bookAppointment') }}
                    </button>
                    <button class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:border-brand-primary/30 hover:text-brand-primary hover:bg-brand-primary/5 transition-all cursor-pointer" @click="openChat">
                      <span class="material-symbols-outlined text-base">forum</span>
                      {{ t('doctorDetail.chatWithDoctor') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>

    <LandingFooter />

    <BookAppointmentModal :show="bookModal" :staff-uuid="props.uuid" @close="bookModal = false" @booked="bookModal = false" />

    <ChatSidebar
      :show="chatSidebarVisible"
      :doctor-uuid="doctor?.user?.uuid || doctor?.user_uuid || ''"
      :doctor-name="resolveTranslatedValue(doctor?.name, locale.value)"
      :doctor-avatar="doctor?.avatar || doctor?.profile_image || ''"
      @close="chatSidebarVisible = false"
    />

    <!-- Avatar Preview Modal -->
    <Teleport to="body">
      <div v-if="showAvatarPreview && avatarSrc" class="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" @click.self="showAvatarPreview = false">
        <button class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer z-10" @click="showAvatarPreview = false">
          <span class="material-symbols-outlined">close</span>
        </button>
        <img :src="avatarSrc" :alt="resolveTranslatedValue(doctor.name, locale.value)" class="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain" @click.stop />
      </div>
    </Teleport>
  </div>
</template>
