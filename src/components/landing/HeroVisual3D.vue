<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const root = ref(null)
const mx = ref(0)
const my = ref(0)
const loaded = ref(false)
let raf = null

function onMove(e) {
  if (!root.value) return
  const r = root.value.getBoundingClientRect()
  mx.value = ((e.clientX - r.left) / r.width - 0.5) * 2
  my.value = ((e.clientY - r.top) / r.height - 0.5) * 2
}

function onLeave() {
  mx.value = 0
  my.value = 0
}

onMounted(() => {
  setTimeout(() => { loaded.value = true }, 100)
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <div
    ref="root"
    class="relative w-full h-[360px] sm:h-[420px] lg:h-[520px] select-none"
    style="perspective: 1000px; perspective-origin: 50% 50%"
    @mousemove="onMove"
    @mouseleave="onLeave"
  >
    <!-- ─── AMBIENT GLOW ─── -->
    <div class="absolute inset-0 pointer-events-none overflow-visible">
      <div class="absolute top-[20%] left-[30%] w-[320px] h-[320px] rounded-full blur-[120px] bg-brand-primary/10" />
      <div class="absolute bottom-[10%] right-[20%] w-[280px] h-[280px] rounded-full blur-[100px] bg-amber-400/8" />
      <div class="absolute top-[60%] left-[60%] w-[200px] h-[200px] rounded-full blur-[80px] bg-brand-accent/8" />
    </div>

    <!-- ─── 3D SCENE ─── -->
    <div
      class="absolute inset-0 transition-transform duration-[600ms] ease-out"
      style="transform-style: preserve-3d"
      :style="{ transform: `rotateX(${my * -6}deg) rotateY(${mx * 8}deg)` }"
    >

      <!-- ═══ CARD: Next Appointment ═══ -->
      <div class="absolute hero-float" style="top: 6%; left: 5%; animation-delay: 0s; animation-duration: 6s">
        <div
          class="w-[220px] sm:w-[240px] rounded-2xl p-4 transition-all duration-500"
          :class="loaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'"
          :style="{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 80px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
            transform: `translateZ(50px) translateX(${mx * 15}px) translateY(${my * -10}px)`,
            transitionDelay: '0.1s'
          }"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center" style="box-shadow: 0 0 20px rgba(16,185,129,0.15)">
              <span class="material-symbols-outlined text-emerald-400" style="font-size: 20px">calendar_month</span>
            </div>
            <div>
              <p class="text-slate-400 font-medium" style="font-size: 11px">Next Appointment</p>
              <p class="text-white font-bold text-sm">Dr. Ahmed Hassan</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-slate-400 mb-3" style="font-size: 11px">
            <span class="material-symbols-outlined text-emerald-400/60" style="font-size: 14px">schedule</span>
            Tomorrow at 10:00 AM
          </div>
          <div class="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300" style="width: 75%; box-shadow: 0 0 12px rgba(16,185,129,0.4)" />
          </div>
        </div>
      </div>

      <!-- ═══ CARD: Health Score ═══ -->
      <div class="absolute hero-float" style="top: 3%; right: 3%; animation-delay: 1.2s; animation-duration: 7s">
        <div
          class="w-[180px] sm:w-[200px] rounded-2xl p-4 transition-all duration-500"
          :class="loaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'"
          :style="{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(245,158,11,0.06), inset 0 1px 0 rgba(255,255,255,0.1)',
            transform: `translateZ(70px) translateX(${mx * -12}px) translateY(${my * -14}px)`,
            transitionDelay: '0.25s'
          }"
        >
          <p class="text-slate-400 font-medium mb-2" style="font-size: 11px">Health Score</p>
          <div class="flex items-end gap-2">
            <span class="text-4xl font-extrabold text-white leading-none" style="text-shadow: 0 0 30px rgba(255,255,255,0.1)">92</span>
            <span class="text-emerald-400 font-bold mb-1" style="font-size: 13px">+4</span>
          </div>
          <div class="mt-3 flex gap-1">
            <div v-for="i in 7" :key="i" class="flex-1 rounded-sm transition-all duration-300"
              :style="{
                height: '22px',
                background: i <= 5
                  ? `linear-gradient(180deg, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0.15) 100%)`
                  : 'rgba(255,255,255,0.04)',
                boxShadow: i <= 5 ? '0 0 8px rgba(16,185,129,0.2)' : 'none'
              }"
            />
          </div>
        </div>
      </div>

      <!-- ═══ CARD: Quick Actions ═══ -->
      <div class="absolute hero-float" style="bottom: 16%; left: 2%; animation-delay: 2.4s; animation-duration: 8s">
        <div
          class="w-[200px] sm:w-[220px] rounded-2xl p-4 transition-all duration-500"
          :class="loaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'"
          :style="{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
            transform: `translateZ(35px) translateX(${mx * 18}px) translateY(${my * -8}px)`,
            transitionDelay: '0.4s'
          }"
        >
          <p class="text-slate-400 font-medium mb-3" style="font-size: 11px">Quick Actions</p>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="action in [
              { icon: 'medication', color: 'amber', label: 'Prescriptions' },
              { icon: 'lab_research', color: 'sky', label: 'Lab Results' },
              { icon: 'favorite', color: 'rose', label: 'Vitals' },
              { icon: 'smart_toy', color: 'violet', label: 'AI Assist' }
            ]" :key="action.label"
              class="flex flex-col items-center gap-1.5 rounded-xl py-2.5 px-2 transition-all duration-300 hover:bg-white/10 cursor-pointer"
              :style="{
                background: 'rgba(255,255,255,0.04)',
                boxShadow: '0 0 12px rgba(0,0,0,0.1)'
              }"
            >
              <span class="material-symbols-outlined" :class="`text-${action.color}-400`" style="font-size: 18px">{{ action.icon }}</span>
              <span class="text-slate-300 font-medium" style="font-size: 10px">{{ action.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ CARD: Notification ═══ -->
      <div class="absolute hero-float" style="bottom: 10%; right: 5%; animation-delay: 1.6s; animation-duration: 6.5s">
        <div
          class="w-[185px] sm:w-[200px] rounded-2xl p-3.5 transition-all duration-500"
          :class="loaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'"
          :style="{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 40px rgba(56,189,248,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
            transform: `translateZ(55px) translateX(${mx * -10}px) translateY(${my * -12}px)`,
            transitionDelay: '0.5s'
          }"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style="background: rgba(56,189,248,0.12); box-shadow: 0 0 16px rgba(56,189,248,0.15)">
              <span class="material-symbols-outlined text-sky-400" style="font-size: 16px">notifications</span>
            </div>
            <div class="min-w-0">
              <p class="text-white font-semibold truncate" style="font-size: 11px">New Message</p>
              <p class="text-slate-400 truncate" style="font-size: 10px">Dr. Sara replied</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ 3D RING 1 ═══ -->
      <div class="absolute hero-float" style="top: 28%; left: 40%; animation-delay: 0.6s; animation-duration: 5s">
        <div
          class="rounded-full transition-all duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          :style="{
            width: '100px', height: '100px',
            border: '2px solid rgba(245,158,11,0.15)',
            boxShadow: '0 0 30px rgba(245,158,11,0.08), inset 0 0 30px rgba(245,158,11,0.04)',
            transform: `translateZ(80px) translateX(${mx * 22}px) translateY(${my * -16}px) rotateX(65deg) rotateZ(${mx * 25}deg)`,
            transitionDelay: '0.3s'
          }"
        />
      </div>

      <!-- ═══ 3D RING 2 ═══ -->
      <div class="absolute hero-float" style="top: 50%; right: 18%; animation-delay: 3.2s; animation-duration: 7.5s">
        <div
          class="rounded-full transition-all duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          :style="{
            width: '65px', height: '65px',
            border: '1.5px solid rgba(2,122,117,0.2)',
            boxShadow: '0 0 20px rgba(2,122,117,0.08)',
            transform: `translateZ(60px) translateX(${mx * -16}px) translateY(${my * -12}px) rotateX(58deg) rotateZ(${mx * -18}deg)`,
            transitionDelay: '0.6s'
          }"
        />
      </div>

      <!-- ═══ GLOWING ORB 1 ═══ -->
      <div class="absolute hero-float" style="top: 36%; left: 33%; animation-delay: 0.9s; animation-duration: 4.5s">
        <div
          class="rounded-full transition-all duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          :style="{
            width: '20px', height: '20px',
            background: 'radial-gradient(circle, rgba(245,158,11,0.95) 0%, rgba(245,158,11,0) 70%)',
            boxShadow: '0 0 30px rgba(245,158,11,0.6), 0 0 80px rgba(245,158,11,0.25), 0 0 120px rgba(245,158,11,0.1)',
            transform: `translateZ(90px) translateX(${mx * 26}px) translateY(${my * -20}px)`,
            transitionDelay: '0.35s'
          }"
        />
      </div>

      <!-- ═══ GLOWING ORB 2 ═══ -->
      <div class="absolute hero-float" style="top: 60%; left: 55%; animation-delay: 2s; animation-duration: 5.5s">
        <div
          class="rounded-full transition-all duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          :style="{
            width: '14px', height: '14px',
            background: 'radial-gradient(circle, rgba(2,122,117,0.9) 0%, rgba(2,122,117,0) 70%)',
            boxShadow: '0 0 24px rgba(2,122,117,0.5), 0 0 60px rgba(2,122,117,0.2)',
            transform: `translateZ(65px) translateX(${mx * -14}px) translateY(${my * -10}px)`,
            transitionDelay: '0.5s'
          }"
        />
      </div>

      <!-- ═══ SMALL DOTS ═══ -->
      <div class="absolute hero-float" style="top: 20%; right: 30%; animation-delay: 2.6s; animation-duration: 5s">
        <div
          class="rounded-full transition-all duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          :style="{
            width: '6px', height: '6px',
            background: 'rgba(2,122,117,0.7)',
            boxShadow: '0 0 16px rgba(2,122,117,0.6), 0 0 40px rgba(2,122,117,0.2)',
            transform: `translateZ(50px) translateX(${mx * -18}px) translateY(${my * -14}px)`,
            transitionDelay: '0.45s'
          }"
        />
      </div>
      <div class="absolute hero-float" style="bottom: 28%; left: 20%; animation-delay: 1.3s; animation-duration: 6.5s">
        <div
          class="rounded-full transition-all duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          :style="{
            width: '5px', height: '5px',
            background: 'rgba(56,189,248,0.6)',
            boxShadow: '0 0 14px rgba(56,189,248,0.5), 0 0 36px rgba(56,189,248,0.15)',
            transform: `translateZ(40px) translateX(${mx * 22}px) translateY(${my * -16}px)`,
            transitionDelay: '0.55s'
          }"
        />
      </div>
      <div class="absolute hero-float" style="top: 55%; left: 58%; animation-delay: 3.6s; animation-duration: 5.2s">
        <div
          class="rounded-full transition-all duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          :style="{
            width: '4px', height: '4px',
            background: 'rgba(245,158,11,0.6)',
            boxShadow: '0 0 12px rgba(245,158,11,0.5)',
            transform: `translateZ(70px) translateX(${mx * -10}px) translateY(${my * -8}px)`,
            transitionDelay: '0.65s'
          }"
        />
      </div>
      <div class="absolute hero-float" style="bottom: 35%; right: 28%; animation-delay: 4s; animation-duration: 6s">
        <div
          class="rounded-full transition-all duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          :style="{
            width: '3px', height: '3px',
            background: 'rgba(255,255,255,0.4)',
            boxShadow: '0 0 8px rgba(255,255,255,0.3)',
            transform: `translateZ(45px) translateX(${mx * 16}px) translateY(${my * -12}px)`,
            transitionDelay: '0.75s'
          }"
        />
      </div>

      <!-- ═══ GRADIENT LINES ═══ -->
      <div class="absolute hero-float" style="top: 48%; left: 15%; animation-delay: 0.8s; animation-duration: 6s">
        <div
          class="h-px transition-all duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          :style="{
            width: '130px',
            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)',
            boxShadow: '0 0 12px rgba(245,158,11,0.15)',
            transform: `translateZ(25px) rotateY(${mx * 12}deg)`,
            transitionDelay: '0.7s'
          }"
        />
      </div>
      <div class="absolute hero-float" style="top: 32%; right: 10%; animation-delay: 2.3s; animation-duration: 7s">
        <div
          class="h-px transition-all duration-500"
          :class="loaded ? 'opacity-100' : 'opacity-0'"
          :style="{
            width: '90px',
            background: 'linear-gradient(90deg, transparent, rgba(2,122,117,0.35), transparent)',
            boxShadow: '0 0 10px rgba(2,122,117,0.12)',
            transform: `translateZ(30px) rotateY(${mx * -10}deg)`,
            transitionDelay: '0.8s'
          }"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
.hero-float {
  animation: heroFloat ease-in-out infinite;
}

@keyframes heroFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
</style>
