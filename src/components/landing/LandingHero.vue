<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  stats: { type: Object, default: null },
  loading: { type: Boolean, default: true }
});

const router = useRouter();
const { t } = useI18n();
const searchQuery = ref('');
const locationQuery = ref('');

const statPills = computed(() => [
  { value: props.stats?.hospitals ?? 0, label: t('stats.hospitals'), icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { value: props.stats?.doctors ?? 0, label: t('stats.doctors'), icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  { value: props.stats?.pharmacies ?? 0, label: t('stats.pharmacies'), icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
]);

function handleSearch() {
  const params = {};
  if (searchQuery.value) params.q = searchQuery.value;
  if (locationQuery.value) params.location = locationQuery.value;
  router.push({ path: '/facilities', query: params });
}
</script>

<template>
  <section class="relative min-h-[90vh] flex items-center bg-slate-900 overflow-hidden">
    <div class="absolute inset-0 dots-pattern opacity-40"></div>
    <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
    <div class="absolute top-0 left-1/3 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-3xl"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full pt-24 lg:pt-0">
      <div class="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div class="lg:col-span-7 space-y-8 py-12 lg:py-16">
          <div class="space-y-4 animate-fade-in-up">
            <span class="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/15 text-amber-300 text-xs font-semibold rounded-full w-fit tracking-wide border border-amber-400/20">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              HES Connect
            </span>

            <h1 class="text-[clamp(2rem,5vw,3.75rem)] font-extrabold text-white leading-[1.1] tracking-[-0.02em]">
              <span v-if="$i18n.locale === 'ar'">
                رعاية صحية موثوقة<br />
                <span class="text-amber-400 underline decoration-amber-400/30 underline-offset-8 decoration-4">لجميع أنحاء غزة</span>
              </span>
              <span v-else>
                Connecting You to<br />
                <span class="text-amber-400 underline decoration-amber-400/30 underline-offset-8 decoration-4">Trusted Healthcare</span><br />
              <!-- WARM HIGHLIGHT INTENTIONAL FOR HERO -->
                Across Gaza
              </span>
            </h1>

            <p class="text-lg text-slate-400 leading-relaxed max-w-lg">
              {{ $t('hero.subtitle') }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-0 sm:gap-0 w-full max-w-xl animate-fade-in-up rounded-xl overflow-hidden shadow-soft shadow-black/20">
            <div class="relative flex-1">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search facilities or doctors..."
                class="w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border-0 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-amber-400/30 outline-none"
                @keydown.enter="handleSearch"
              />
            </div>
            <div class="relative flex-1 border-t sm:border-t-0 sm:border-l border-white/5">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
              </svg>
              <input
                v-model="locationQuery"
                type="text"
                placeholder="Location..."
                class="w-full pl-10 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border-0 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-amber-400/30 outline-none"
                @keydown.enter="handleSearch"
              />
            </div>
            <button
              class="px-6 py-3.5 bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary-hover transition shrink-0 cursor-pointer"
              @click="handleSearch"
            >
              Search
            </button>
          </div>

          <div class="flex flex-wrap gap-3 animate-fade-in-up">
            <button
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-sm text-white text-sm font-semibold rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
              @click="router.push('/facilities')"
            >
              Explore Facilities
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
              </svg>
            </button>
            <button
              class="inline-flex items-center gap-2 px-5 py-2.5 text-slate-400 text-sm font-semibold rounded-lg border border-white/5 hover:text-white hover:border-white/20 transition-all duration-200 cursor-pointer"
              @click="router.push('/contact')"
            >
              Contact Us
            </button>
          </div>
        </div>

        <div class="hidden lg:flex lg:col-span-5 justify-center items-center">
          <svg viewBox="0 0 400 400" class="w-full max-w-sm text-white/5" fill="currentColor">
            <circle cx="200" cy="200" r="180" stroke="currentColor" stroke-width="0.5" fill="none" class="text-white/10"/>
            <circle cx="200" cy="200" r="140" stroke="currentColor" stroke-width="0.5" fill="none" class="text-white/8"/>
            <circle cx="200" cy="200" r="100" stroke="currentColor" stroke-width="0.5" fill="none" class="text-white/6"/>
            <path d="M200 80 L200 120 M180 100 L220 100" stroke="currentColor" stroke-width="2" class="text-white/20"/>
            <path d="M280 200 L320 200 M300 180 L300 220" stroke="currentColor" stroke-width="2" class="text-white/20"/>
            <path d="M120 200 L80 200 M100 180 L100 220" stroke="currentColor" stroke-width="2" class="text-white/20"/>
            <path d="M200 320 L200 280 M180 300 L220 300" stroke="currentColor" stroke-width="2" class="text-white/20"/>
            <path d="M155 155 L245 245 M155 245 L245 155" stroke="currentColor" stroke-width="1" class="text-white/10"/>
            <circle cx="200" cy="200" r="4" class="text-amber-400"/>
            <circle cx="260" cy="150" r="3" class="text-white/20"/>
            <circle cx="140" cy="160" r="2.5" class="text-white/15"/>
            <circle cx="230" cy="260" r="2" class="text-white/15"/>
            <circle cx="170" cy="240" r="2.5" class="text-white/10"/>
            <circle cx="120" cy="220" r="1.5" class="text-white/10"/>
            <circle cx="280" cy="230" r="2" class="text-white/10"/>
          </svg>
        </div>
      </div>

      <div class="relative -bottom-8 lg:-bottom-12 flex flex-wrap gap-3 animate-fade-in-up" style="animation-delay: 0.3s">
        <div v-if="loading" class="flex gap-3">
          <div v-for="n in 3" :key="n" class="h-12 w-36 bg-white/5 rounded-lg animate-pulse"></div>
        </div>
        <template v-else>
          <div
            v-for="pill in statPills"
            :key="pill.label"
            class="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/5 shadow-soft"
          >
            <svg class="w-4 h-4 text-amber-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" :d="pill.icon"/>
            </svg>
            <span class="text-white font-bold text-sm">{{ pill.value.toLocaleString() }}+</span>
            <span class="text-slate-400 text-xs">{{ pill.label }}</span>
          </div>
        </template>
      </div>
    </div>

  </section>
</template>
