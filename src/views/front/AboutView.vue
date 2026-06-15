<script setup>
import AppNavbar from '../../components/global/AppNavbar.vue'
import LandingFooter from '../../components/landing/LandingFooter.vue'
import PageHero from '../../components/shared/PageHero.vue'
import SectionContainer from '../../components/shared/SectionContainer.vue'

const values = [
  {
    title: 'Access to Care',
    description: 'Help patients find trusted doctors, facilities, pharmacies, and services in one reliable place.'
  },
  {
    title: 'Operational Clarity',
    description: 'Give healthcare teams a cleaner way to manage appointments, stories, articles, jobs, and public information.'
  },
  {
    title: 'Community Support',
    description: 'Make it easier for people to discover urgent stories and support healthcare needs across Gaza.'
  }
]

const stats = [
  { value: '24/7', label: 'Platform availability' },
  { value: '4', label: 'Healthcare categories' },
  { value: '1', label: 'Connected ecosystem' }
]

const features = [
  {
    title: 'Facility & Provider Discovery',
    description: 'Patients can easily find trusted doctors, clinics, hospitals, and pharmacies with detailed profiles and contact information.'
  },
  {
    title: 'Appointment Management',
    description: 'Healthcare teams get a streamlined system for scheduling, rescheduling, and managing patient appointments efficiently.'
  },
  {
    title: 'Content Publishing',
    description: 'Share healthcare stories, educational articles, job openings, and public updates through an integrated content platform.'
  },
  {
    title: 'Review & Ratings',
    description: 'Patients can share their experiences through reviews, helping others make informed healthcare decisions.'
  },
  {
    title: 'Multilingual Support',
    description: 'The platform supports multiple languages to serve the diverse linguistic needs of the Gaza community.'
  },
  {
    title: 'Real-time Updates',
    description: 'Stay informed with real-time notifications about appointments, new content, and important healthcare announcements.'
  }
]
</script>

<template>
  <div class="min-h-screen bg-surface-secondary dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <PageHero
      title="About HES Connect"
      description="HES Connect is a healthcare ecosystem platform that connects healthcare facilities, doctors, organizations, and healthcare services across the Gaza Strip."
      :breadcrumbs="[
        { label: 'Home', to: '/' },
        { label: 'About' }
      ]"
    />

    <main>
      <!-- Mission & Vision -->
      <SectionContainer
        eyebrow="Our Purpose"
        title="Making healthcare accessible for everyone"
        subtitle="HES Connect was built to bridge the gap between patients and healthcare services in Gaza, creating a single trusted ecosystem for discovery, communication, and care."
        align="center"
        padding="py-14 lg:py-16"
      >
        <div class="grid md:grid-cols-2 gap-6 mt-2">
          <div class="card-hover p-8">
            <div class="icon-box mb-5">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Mission</h3>
            <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
              To provide a clear, reliable digital layer that connects patients with the healthcare services they need, while giving operators the tools to manage information effectively.
            </p>
          </div>
          <div class="card-hover p-8">
            <div class="icon-box mb-5">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Vision</h3>
            <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
              A future where every person in Gaza can easily find, access, and engage with the healthcare services they need through a single trusted platform.
            </p>
          </div>
        </div>
      </SectionContainer>

      <!-- Core Values -->
      <section class="bg-white dark:bg-slate-800/50 section-padding">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-10 lg:mb-12">
            <span class="eyebrow-badge mb-4">
              <span class="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
              Core Values
            </span>
            <h2 class="section-heading-center">What drives us forward</h2>
          </div>
          <div class="grid sm:grid-cols-3 gap-6">
            <div
              v-for="item in values"
              :key="item.title"
              class="card-hover p-6"
            >
              <div class="icon-box mb-4">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ item.title }}</h3>
              <p class="text-sm leading-6 text-slate-500 dark:text-slate-400">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics -->
      <section class="bg-gradient-to-br from-brand-primary to-brand-primary-dark section-padding">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:items-center">
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold text-white">Built for patients and administrators.</h2>
              <p class="mt-4 text-sm leading-7 text-white/80">
                The system keeps public access simple while giving the healthcare management team the structure they need to maintain trusted, up-to-date information.
              </p>
            </div>
            <div class="grid sm:grid-cols-3 gap-4">
              <div
                v-for="stat in stats"
                :key="stat.label"
                class="rounded-xl bg-white/10 p-5 text-center backdrop-blur-sm"
              >
                <p class="text-3xl font-extrabold text-white">{{ stat.value }}</p>
                <p class="mt-2 text-xs font-medium text-white/75">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Platform Features -->
      <SectionContainer
        eyebrow="Platform Features"
        title="Everything you need in one place"
        subtitle="From provider discovery to content management, HES Connect provides a complete toolkit for healthcare coordination."
        align="center"
        padding="section-padding"
      >
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="card-hover p-6"
          >
            <div class="icon-box mb-4">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">{{ feature.title }}</h3>
            <p class="text-sm leading-6 text-slate-500 dark:text-slate-400">{{ feature.description }}</p>
          </div>
        </div>
      </SectionContainer>

      <!-- CTA Section -->
      <section class="bg-white dark:bg-slate-800/50 section-padding">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark p-8 sm:p-12 lg:p-16 text-center">
            <div class="absolute inset-0 bg-white/5">
              <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
              <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
            </div>
            <div class="relative">
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Ready to transform healthcare access?
              </h2>
              <p class="mt-4 text-base text-white/80 max-w-xl mx-auto">
                Join us in building a clearer, more connected healthcare ecosystem for Gaza.
              </p>
              <div class="mt-8 flex flex-wrap justify-center gap-4">
                <button class="bg-white text-brand-primary rounded-xl px-6 py-3 font-semibold shadow-sm hover:bg-white/90 hover:shadow-lg transition-all cursor-pointer">
                  Get Started
                </button>
                <button class="border-2 border-white/30 text-white rounded-xl px-6 py-3 font-semibold hover:bg-white/10 transition-all cursor-pointer">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>
