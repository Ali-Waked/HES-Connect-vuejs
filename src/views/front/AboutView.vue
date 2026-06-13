<script setup>
import AppNavbar from '../../components/global/AppNavbar.vue';
import LandingFooter from '../../components/landing/LandingFooter.vue';

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
];

const stats = [
  { value: '24/7', label: 'Platform availability' },
  { value: '4', label: 'Healthcare categories' },
  { value: '1', label: 'Connected ecosystem' }
];
</script>

<template>
  <div class="min-h-screen bg-landing-cream font-sans antialiased text-landing-dark">
    <AppNavbar variant="landing" />

    <main class="pt-28 lg:pt-32">
      <section class="border-b border-landing-border bg-white/60/60">
        <div class="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-20 lg:pt-14">
          <div>
            <span class="inline-flex rounded-full bg-brand-primary/10 px-3 py-1.5 text-xs font-bold uppercase text-brand-primary">
              About Health Garagantam
            </span>
            <h1 class="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              A clearer healthcare access layer for Gaza.
            </h1>
            <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Health Garagantam connects patients, healthcare providers, facilities, pharmacies, and support services through a focused digital platform built for real healthcare workflows.
            </p>
          </div>

          <div class="rounded-2xl border border-landing-border bg-landing-cream p-6 shadow-sm">
            <h2 class="text-base font-bold text-slate-950">What the platform supports</h2>
            <div class="mt-5 space-y-4">
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-brand-primary"></span>
                <p class="text-sm leading-6 text-slate-600">Facility and provider discovery for patients.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-brand-primary"></span>
                <p class="text-sm leading-6 text-slate-600">Administrative workflows for healthcare operators.</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-brand-primary"></span>
                <p class="text-sm leading-6 text-slate-600">Stories, articles, jobs, reviews, and public updates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-14 lg:py-16">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="grid gap-5 sm:grid-cols-3">
            <article
              v-for="item in values"
              :key="item.title"
              class="rounded-2xl border border-landing-border bg-white p-6 shadow-sm"
            >
              <h2 class="text-lg font-bold text-slate-950">{{ item.title }}</h2>
              <p class="mt-3 text-sm leading-6 text-slate-500">{{ item.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-brand-primary py-14 text-white lg:py-16">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <h2 class="text-2xl font-bold sm:text-3xl">Built for patients and administrators.</h2>
              <p class="mt-4 text-sm leading-7 text-white/80">
                The system keeps public access simple while giving the healthcare management team the structure they need to maintain trusted, up-to-date information.
              </p>
            </div>
            <div class="grid gap-4 sm:grid-cols-3">
              <div v-for="stat in stats" :key="stat.label" class="rounded-xl bg-white/10 p-5 text-center">
                <p class="text-3xl font-extrabold">{{ stat.value }}</p>
                <p class="mt-2 text-xs font-medium text-white/75">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>
