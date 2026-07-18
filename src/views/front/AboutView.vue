<script setup>
import AppNavbar from '@/components/global/AppNavbar.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const values = [
  { title: 'Access to Care', description: 'Help patients find trusted doctors, facilities, pharmacies, and services in one reliable place.' },
  { title: 'Operational Clarity', description: 'Give healthcare teams a cleaner way to manage appointments, stories, articles, jobs, and public information.' },
  { title: 'Community Support', description: 'Make it easier for people to discover urgent stories and support healthcare needs across Gaza.' }
]

const features = [
  { title: 'Facility & Provider Discovery', description: 'Patients can easily find trusted doctors, clinics, hospitals, and pharmacies with detailed profiles and contact information.' },
  { title: 'Appointment Management', description: 'Healthcare teams get a streamlined system for scheduling, rescheduling, and managing patient appointments efficiently.' },
  { title: 'Content Publishing', description: 'Share healthcare stories, educational articles, job openings, and public updates through an integrated content platform.' },
  { title: 'Review & Ratings', description: 'Patients can share their experiences through reviews, helping others make informed healthcare decisions.' },
  { title: 'Multilingual Support', description: 'The platform supports multiple languages to serve the diverse linguistic needs of the Gaza community.' },
  { title: 'Real-time Updates', description: 'Stay informed with real-time notifications about appointments, new content, and important healthcare announcements.' }
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <AppNavbar variant="landing" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-28 lg:pt-32">
      <!-- Hero -->
      <div class="text-center mb-16">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full mb-4 border border-brand-primary/20">
          <span class="material-symbols-outlined text-sm">info</span>
          About Us
        </span>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Making healthcare accessible for everyone
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          HES Connect was built to bridge the gap between patients and healthcare services in Gaza, creating a single trusted ecosystem for discovery, communication, and care.
        </p>
      </div>

      <!-- Mission & Vision -->
      <div class="grid md:grid-cols-2 gap-6 mb-20">
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-5">
            <span class="material-symbols-outlined text-xl">bolt</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Mission</h3>
          <p class="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
            To provide a clear, reliable digital layer that connects patients with the healthcare services they need, while giving operators the tools to manage information effectively.
          </p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 hover:shadow-md transition">
          <div class="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-5">
            <span class="material-symbols-outlined text-xl">visibility</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Vision</h3>
          <p class="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
            A future where every person in Gaza can easily find, access, and engage with the healthcare services they need through a single trusted platform.
          </p>
        </div>
      </div>

      <!-- Core Values -->
      <div class="mb-20">
        <div class="text-center mb-10">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
            Core Values
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">What drives us forward</h2>
        </div>
        <div class="grid sm:grid-cols-3 gap-6">
          <div v-for="(item, idx) in values" :key="item.title" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition text-center">
            <div class="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mx-auto mb-4">
              <span class="material-symbols-outlined text-xl">{{ idx === 0 ? 'favorite' : idx === 1 ? 'visibility' : 'groups' }}</span>
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">{{ item.title }}</h3>
            <p class="text-sm leading-6 text-slate-500 dark:text-slate-400">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Banner -->
      <div class="bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-2xl p-8 sm:p-12 mb-20">
        <div class="grid lg:grid-cols-2 gap-8 lg:items-center">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-white">Built for patients and administrators.</h2>
            <p class="mt-4 text-sm leading-7 text-white/80">The system keeps public access simple while giving the healthcare management team the structure they need to maintain trusted, up-to-date information.</p>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="rounded-xl bg-white/10 p-5 text-center backdrop-blur-sm">
              <p class="text-3xl font-extrabold text-white">24/7</p>
              <p class="mt-2 text-xs font-medium text-white/75">Platform availability</p>
            </div>
            <div class="rounded-xl bg-white/10 p-5 text-center backdrop-blur-sm">
              <p class="text-3xl font-extrabold text-white">4</p>
              <p class="mt-2 text-xs font-medium text-white/75">Healthcare categories</p>
            </div>
            <div class="rounded-xl bg-white/10 p-5 text-center backdrop-blur-sm">
              <p class="text-3xl font-extrabold text-white">1</p>
              <p class="mt-2 text-xs font-medium text-white/75">Connected ecosystem</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="mb-20">
        <div class="text-center mb-10">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold rounded-full mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
            Platform Features
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Everything you need in one place</h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="(feature, idx) in features" :key="feature.title" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition">
            <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
              <span class="material-symbols-outlined text-lg">check_circle</span>
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">{{ feature.title }}</h3>
            <p class="text-sm leading-6 text-slate-500 dark:text-slate-400">{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark p-8 sm:p-12 lg:p-16 text-center">
        <div class="absolute inset-0 bg-white/5">
          <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
          <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
        </div>
        <div class="relative">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Ready to transform healthcare access?</h2>
          <p class="mt-4 text-base text-white/80 max-w-xl mx-auto">Join us in building a clearer, more connected healthcare ecosystem for Gaza.</p>
          <div class="mt-8 flex flex-wrap justify-center gap-4">
            <button class="bg-white text-brand-primary rounded-xl px-6 py-3 font-semibold shadow-sm hover:bg-white/90 hover:shadow-lg transition-all cursor-pointer">Get Started</button>
            <button class="border-2 border-white/30 text-white rounded-xl px-6 py-3 font-semibold hover:bg-white/10 transition-all cursor-pointer">Learn More</button>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>
