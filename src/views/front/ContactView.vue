<script setup>
import { reactive, ref } from 'vue';
import AppNavbar from '../../components/global/AppNavbar.vue';
import LandingFooter from '../../components/landing/LandingFooter.vue';

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const errors = ref({});
const submitted = ref(false);

const contactCards = [
  { label: 'Email', value: 'info@healthgaragantam.ps', icon: 'mail' },
  { label: 'Phone', value: '+970 59 000 0000', icon: 'call' },
  { label: 'Location', value: 'Gaza, Palestine', icon: 'location_on' }
];

function validate() {
  const next = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.name.trim()) next.name = 'Name is required.';
  if (!form.email.trim()) next.email = 'Email is required.';
  else if (!emailPattern.test(form.email)) next.email = 'Enter a valid email address.';
  if (!form.subject.trim()) next.subject = 'Subject is required.';
  if (!form.message.trim()) next.message = 'Message is required.';

  errors.value = next;
  return Object.keys(next).length === 0;
}

function submit() {
  submitted.value = false;
  if (!validate()) return;

  submitted.value = true;
  form.name = '';
  form.email = '';
  form.subject = '';
  form.message = '';
}
</script>

<template>
  <div class="min-h-screen bg-landing-cream font-sans antialiased text-landing-dark">
    <AppNavbar variant="landing" />

    <main class="pt-28 lg:pt-32">
      <section class="border-b border-landing-border bg-white/60/60">
        <div class="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
          <span class="inline-flex rounded-full bg-brand-primary/10 px-3 py-1.5 text-xs font-bold uppercase text-brand-primary">
            Contact Us
          </span>
          <h1 class="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Talk to the Health Garagantam team.
          </h1>
          <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Send a message for support, partnerships, facility updates, or questions about using the healthcare platform.
          </p>
        </div>
      </section>

      <section class="py-14 lg:py-16">
        <div class="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <aside class="space-y-4">
            <article
              v-for="card in contactCards"
              :key="card.label"
              class="flex items-start gap-4 rounded-2xl border border-landing-border bg-white p-5 shadow-sm"
            >
              <span class="material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary" style="display:flex;">
                {{ card.icon }}
              </span>
              <div>
                <p class="text-sm font-bold text-slate-950">{{ card.label }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ card.value }}</p>
              </div>
            </article>
          </aside>

          <section class="rounded-2xl border border-landing-border bg-white p-6 shadow-sm sm:p-8">
            <h2 class="text-xl font-bold text-slate-950">Send a message</h2>
            <p class="mt-2 text-sm text-slate-500">We will review your message and follow up as soon as possible.</p>

            <div v-if="submitted" class="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              Your message was prepared successfully.
            </div>

            <form class="mt-6 grid gap-5 sm:grid-cols-2" @submit.prevent="submit">
              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Full name</span>
                <input v-model="form.name" class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-200 focus:ring-4 focus:ring-brand-primary/10" />
                <span v-if="errors.name" class="text-xs font-semibold text-rose-600">{{ errors.name }}</span>
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Email address</span>
                <input v-model="form.email" type="email" class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-200 focus:ring-4 focus:ring-brand-primary/10" />
                <span v-if="errors.email" class="text-xs font-semibold text-rose-600">{{ errors.email }}</span>
              </label>

              <label class="space-y-2 sm:col-span-2">
                <span class="text-sm font-semibold text-slate-700">Subject</span>
                <input v-model="form.subject" class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-200 focus:ring-4 focus:ring-brand-primary/10" />
                <span v-if="errors.subject" class="text-xs font-semibold text-rose-600">{{ errors.subject }}</span>
              </label>

              <label class="space-y-2 sm:col-span-2">
                <span class="text-sm font-semibold text-slate-700">Message</span>
                <textarea v-model="form.message" rows="5" class="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-200 focus:ring-4 focus:ring-brand-primary/10"></textarea>
                <span v-if="errors.message" class="text-xs font-semibold text-rose-600">{{ errors.message }}</span>
              </label>

              <div class="sm:col-span-2">
                <button type="submit" class="inline-flex h-11 items-center justify-center rounded-lg bg-brand-primary px-6 text-sm font-bold text-white shadow-sm transition hover:bg-brand-primary-hover">
                  Send Message
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>
