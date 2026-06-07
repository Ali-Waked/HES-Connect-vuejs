<script setup>
const quickLinks = ['Home', 'Facilities', 'Doctors', 'Pharmacies', 'Stories', 'About Us', 'Contact'];
const services = ['Book Appointment', 'Find a Doctor', 'Find a Pharmacy', 'Read Articles', 'Post a Job', 'Donate to Stories'];
</script>

<template>
  <footer id="about" class="bg-landing-dark text-stone-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <!-- Brand -->
        <div class="space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center text-white">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-white">Health Garagantam</span>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed">
            Connecting patients with healthcare providers across the Gaza Strip. Find care, book appointments, and support those in need.
          </p>
          <div class="flex gap-3">
            <a v-for="social in ['facebook', 'twitter', 'instagram', 'linkedin']" :key="social" href="#" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
              <span class="sr-only">{{ social }}</span>
              <svg class="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-sm font-bold text-white mb-4">Quick Links</h4>
          <ul class="space-y-2.5">
            <li v-for="link in quickLinks" :key="link">
              <a href="#" class="text-sm text-slate-400 hover:text-white transition">{{ link }}</a>
            </li>
          </ul>
        </div>

        <!-- Services -->
        <div>
          <h4 class="text-sm font-bold text-white mb-4">Services</h4>
          <ul class="space-y-2.5">
            <li v-for="svc in services" :key="svc">
              <a href="#" class="text-sm text-slate-400 hover:text-white transition">{{ svc }}</a>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-sm font-bold text-white mb-4">Contact</h4>
          <ul class="space-y-3 text-sm text-slate-400">
            <li class="flex items-center gap-2.5">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L5.25 8.566a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
              info@healthgaragantam.ps
            </li>
            <li class="flex items-center gap-2.5">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
              +970 59 000 0000
            </li>
            <li class="flex items-center gap-2.5">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
              Gaza, Palestine
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>© 2026 Health Garagantam. All rights reserved.</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-white transition">Privacy Policy</a>
          <a href="#" class="hover:text-white transition">Terms of Service</a>
          <a href="#" class="hover:text-white transition">Contact Us</a>
        </div>
      </div>
    </div>
  </footer>
</template>
