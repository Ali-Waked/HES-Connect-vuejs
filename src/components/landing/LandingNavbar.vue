<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useScrollNavbar } from '../../composables/useScrollNavbar';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { isScrolled } = useScrollNavbar(10);

const mobileOpen = ref(false);
const activeSection = ref('home');
const isHeroTop = computed(() => route.path === '/' && !isScrolled.value);

let sectionObserver = null;

const navLinks = [
  { id: 'home', label: 'Home', href: '#home', type: 'section' },
  { id: 'facilities', label: 'Facilities', href: '/facilities', type: 'route', path: '/facilities' },
  { id: 'doctors', label: 'Doctors', href: '#doctors', type: 'section', sectionId: 'doctors' },
  { id: 'pharmacies', label: 'Pharmacies', href: '/facilities?type=pharmacy', type: 'route', path: '/facilities', query: { type: 'pharmacy' } },
  { id: 'stories', label: 'Stories', href: '#stories', type: 'section', sectionId: 'stories' },
  { id: 'about', label: 'About Us', href: '#about', type: 'section', sectionId: 'about' }
];

function isLinkActive(link) {
  if (link.type === 'route') {
    if (route.path !== link.path) return false;
    if (link.query) {
      return route.query.type === link.query.type;
    }
    return route.query.type !== 'pharmacy';
  }

  if (route.path !== '/') return false;
  return activeSection.value === (link.sectionId || link.id);
}

function linkClasses(link) {
  const active = isLinkActive(link);
  return active
    ? 'bg-brand-primary text-white font-semibold shadow-sm shadow-brand-primary/20'
    : 'text-landing-muted hover:text-brand-primary hover:bg-brand-primary/8';
}

function mobileLinkClasses(link) {
  const active = isLinkActive(link);
  return active
    ? 'bg-brand-primary/10 text-brand-primary font-semibold border-l-[3px] border-brand-primary'
    : 'text-stone-700 hover:bg-brand-primary/5 border-l-[3px] border-transparent';
}

function setupScrollSpy() {
  sectionObserver?.disconnect();
  if (route.path !== '/') return;

  const sectionIds = ['home', 'doctors', 'stories', 'about'];
  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length > 0) {
        activeSection.value = visible[0].target.id;
      }
    },
    { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.7] }
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });
}

async function navigate(link) {
  mobileOpen.value = false;
  const href = typeof link === 'string' ? link : link.href;

  if (href.startsWith('#')) {
    const sectionId = href.slice(1);
    if (route.path !== '/') {
      await router.push('/');
      await nextTick();
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        activeSection.value = sectionId;
      }, 120);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      activeSection.value = sectionId;
    }
    return;
  }

  router.push(href);
}

onMounted(() => {
  setupScrollSpy();
});

onUnmounted(() => {
  sectionObserver?.disconnect();
});

watch(() => route.path, async () => {
  await nextTick();
  setupScrollSpy();
});
</script>
<template>
  <header
    class="fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-out"
    :class="isHeroTop
      ? 'border-b-[#80808038] bg-[linear-gradient(45deg,#d7e2de,#ffffff1c)] shadow-none backdrop-blur-0'
      : 'bg-landing-cream/95 backdrop-blur-md border-landing-border shadow-md shadow-slate-900/5'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 lg:h-[70px]">
        <button class="flex items-center gap-2.5 cursor-pointer group" @click="navigate('#home')">
          <div class="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-primary/25 group-hover:bg-brand-primary-hover transition">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
            </svg>
          </div>
          <span class="text-lg font-bold text-landing-dark tracking-tight">
            Health <span class="text-brand-primary">Garagantam</span>
          </span>
        </button>

        <nav
          class="hidden lg:flex items-center gap-1 p-1 rounded-xl border transition-all duration-300"
          :class="isHeroTop
            ? 'bg-landing-cream/55 border-white/40 backdrop-blur-sm'
            : 'bg-landing-warm/60 border-landing-border/70'"
        >
          <button
            v-for="link in navLinks"
            :key="link.id"
            class="px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
            :class="linkClasses(link)"
            @click="navigate(link)"
          >{{ link.label }}</button>
        </nav>

        <div class="hidden lg:flex items-center gap-3">
          <template v-if="authStore.isAuthenticated">
            <button
              class="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-brand-primary/8 transition cursor-pointer"
              @click="router.push('/profile')"
            >
              <div class="w-9 h-9 bg-brand-primary text-white font-bold rounded-full flex items-center justify-center text-sm ring-2 ring-brand-primary/20">
                {{ authStore.user?.initials }}
              </div>
            </button>
          </template>
          <template v-else>
            <button
              class="px-4 py-2 text-sm font-semibold text-brand-primary border border-brand-primary/40 rounded-lg hover:bg-brand-primary/8 transition cursor-pointer"
              @click="router.push('/login')"
            >Login</button>
            <button
              class="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg shadow-md shadow-brand-primary/20 transition cursor-pointer"
              @click="router.push('/register')"
            >Register</button>
          </template>
        </div>

        <button
          class="lg:hidden p-2 text-landing-muted hover:text-brand-primary hover:bg-brand-primary/8 rounded-lg cursor-pointer transition"
          @click="mobileOpen = !mobileOpen"
        >
          <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <div
      class="lg:hidden overflow-hidden transition-all duration-300 border-t border-landing-border bg-landing-cream"
      :class="mobileOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'"
    >
      <nav class="px-4 py-4 space-y-1">
        <button
          v-for="link in navLinks"
          :key="link.id"
          class="w-full text-left px-4 py-3 text-sm font-medium rounded-lg cursor-pointer transition"
          :class="mobileLinkClasses(link)"
          @click="navigate(link)"
        >{{ link.label }}</button>
        <div class="pt-3 border-t border-landing-border flex flex-col gap-2">
          <template v-if="authStore.isAuthenticated">
            <button class="w-full py-2.5 text-sm font-semibold text-brand-primary border border-brand-primary/40 rounded-lg cursor-pointer" @click="router.push('/profile'); mobileOpen = false">My Profile</button>
          </template>
          <template v-else>
            <button class="w-full py-2.5 text-sm font-semibold text-brand-primary border border-brand-primary/40 rounded-lg cursor-pointer" @click="router.push('/login'); mobileOpen = false">Login</button>
            <button class="w-full py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg cursor-pointer" @click="router.push('/register'); mobileOpen = false">Register</button>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>
