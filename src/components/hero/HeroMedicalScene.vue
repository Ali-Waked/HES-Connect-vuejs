<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const stage = ref(0)
const totalStages = 9
let stageTimer = null

function nextStage() {
  stage.value = (stage.value + 1) % totalStages
}

onMounted(() => {
  stageTimer = setInterval(nextStage, 4000)
})

onBeforeUnmount(() => {
  if (stageTimer) clearInterval(stageTimer)
})
</script>

<template>
  <div class="hero-scene-container relative w-full aspect-square max-w-[480px]">
    <!-- Ambient glow layers -->
    <div class="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 blur-3xl animate-pulse-slow"></div>
    <div class="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-cyan-400/8 rounded-full blur-2xl animate-float-slow"></div>

    <svg viewBox="0 0 480 480" class="w-full h-full relative z-10" fill="none">
      <defs>
        <!-- Gradients -->
        <linearGradient id="hGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.9"/>
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.05"/>
        </linearGradient>
        <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.9"/>
        </linearGradient>
        <linearGradient id="scanBeam" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0"/>
          <stop offset="40%" stop-color="#06b6d4" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#22d3ee" stop-opacity="0.6"/>
          <stop offset="60%" stop-color="#06b6d4" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="strongGlow">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="cardGlow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Orbital rings -->
      <g class="orbital-ring-cw" style="transform-origin:240px 240px">
        <circle cx="240" cy="240" r="210" stroke="#06b6d4" stroke-width="0.5" stroke-dasharray="6 10" fill="none" opacity="0.15"/>
      </g>
      <g class="orbital-ring-ccw" style="transform-origin:240px 240px">
        <circle cx="240" cy="240" r="180" stroke="#8b5cf6" stroke-width="0.4" stroke-dasharray="4 8" fill="none" opacity="0.12"/>
      </g>
      <g class="orbital-ring-cw-slow" style="transform-origin:240px 240px">
        <circle cx="240" cy="240" r="150" stroke="#06b6d4" stroke-width="0.3" stroke-dasharray="3 6" fill="none" opacity="0.08"/>
      </g>

      <!-- Center glow -->
      <circle cx="240" cy="220" r="120" fill="url(#centerGlow)" class="glow-breathe"/>

      <!-- === HOSPITAL BUILDING === -->
      <g class="hospital-float" style="transform-origin:240px 260px">
        <!-- Platform -->
        <ellipse cx="240" cy="295" rx="70" ry="10" fill="#06b6d4" opacity="0.08"/>
        <rect x="185" y="280" width="110" height="8" rx="4" fill="#0e7490" opacity="0.3"/>

        <!-- Main building -->
        <rect x="195" y="210" width="90" height="72" rx="6" fill="#0c4a6e" opacity="0.5" stroke="#06b6d4" stroke-width="0.8" stroke-opacity="0.3"/>
        <!-- Glass panels -->
        <rect x="200" y="215" width="20" height="14" rx="2" fill="#06b6d4" opacity="0.15" stroke="#06b6d4" stroke-width="0.4" stroke-opacity="0.3"/>
        <rect x="225" y="215" width="20" height="14" rx="2" fill="#06b6d4" opacity="0.15" stroke="#06b6d4" stroke-width="0.4" stroke-opacity="0.3"/>
        <rect x="250" y="215" width="20" height="14" rx="2" fill="#06b6d4" opacity="0.15" stroke="#06b6d4" stroke-width="0.4" stroke-opacity="0.3"/>
        <rect x="200" y="235" width="20" height="14" rx="2" fill="#06b6d4" opacity="0.12" stroke="#06b6d4" stroke-width="0.4" stroke-opacity="0.25"/>
        <rect x="225" y="235" width="20" height="14" rx="2" fill="#06b6d4" opacity="0.12" stroke="#06b6d4" stroke-width="0.4" stroke-opacity="0.25"/>
        <rect x="250" y="235" width="20" height="14" rx="2" fill="#06b6d4" opacity="0.12" stroke="#06b6d4" stroke-width="0.4" stroke-opacity="0.25"/>
        <rect x="200" y="255" width="20" height="14" rx="2" fill="#06b6d4" opacity="0.1" stroke="#06b6d4" stroke-width="0.4" stroke-opacity="0.2"/>
        <rect x="225" y="255" width="20" height="14" rx="2" fill="#06b6d4" opacity="0.1" stroke="#06b6d4" stroke-width="0.4" stroke-opacity="0.2"/>
        <rect x="250" y="255" width="20" height="14" rx="2" fill="#06b6d4" opacity="0.1" stroke="#06b6d4" stroke-width="0.4" stroke-opacity="0.2"/>

        <!-- Door -->
        <rect x="228" y="265" width="24" height="18" rx="3" fill="#06b6d4" opacity="0.2" stroke="#22d3ee" stroke-width="0.5" stroke-opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.35;0.2" dur="3s" repeatCount="indefinite"/>
        </rect>

        <!-- Hospital cross -->
        <rect x="236" y="213" width="8" height="16" rx="1" fill="#22d3ee" opacity="0.7" filter="url(#softGlow)"/>
        <rect x="232" y="217" width="16" height="8" rx="1" fill="#22d3ee" opacity="0.7" filter="url(#softGlow)"/>

        <!-- Roof accent -->
        <rect x="192" y="207" width="96" height="4" rx="2" fill="#06b6d4" opacity="0.4"/>

        <!-- Antenna -->
        <line x1="240" y1="207" x2="240" y2="195" stroke="#06b6d4" stroke-width="1" opacity="0.5"/>
        <circle cx="240" cy="193" r="2" fill="#22d3ee" opacity="0.8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
        </circle>
      </g>

      <!-- === AI BRAIN (above hospital) === -->
      <g class="ai-brain-float" style="transform-origin:240px 140px" :class="{ 'ai-active': stage >= 3 }">
        <!-- Brain glow -->
        <circle cx="240" cy="140" r="30" fill="#8b5cf6" opacity="0.06" class="glow-breathe"/>

        <!-- Brain shape -->
        <g filter="url(#softGlow)" opacity="0.85">
          <!-- Left hemisphere -->
          <path d="M225 125 C215 125, 208 135, 208 145 C208 158, 218 165, 228 165 L228 125Z" fill="url(#aiGrad)" opacity="0.7"/>
          <!-- Right hemisphere -->
          <path d="M255 125 C265 125, 272 135, 272 145 C272 158, 262 165, 252 165 L252 125Z" fill="url(#aiGrad)" opacity="0.7"/>
          <!-- Center line -->
          <line x1="240" y1="120" x2="240" y2="168" stroke="#8b5cf6" stroke-width="0.8" opacity="0.5"/>
          <!-- Neural folds -->
          <path d="M220 132 Q230 128, 238 133" stroke="#c4b5fd" stroke-width="0.6" fill="none" opacity="0.5"/>
          <path d="M242 133 Q250 128, 260 132" stroke="#c4b5fd" stroke-width="0.6" fill="none" opacity="0.5"/>
          <path d="M215 142 Q225 137, 238 143" stroke="#c4b5fd" stroke-width="0.6" fill="none" opacity="0.4"/>
          <path d="M242 143 Q255 137, 265 142" stroke="#c4b5fd" stroke-width="0.6" fill="none" opacity="0.4"/>
          <path d="M218 152 Q228 148, 238 153" stroke="#c4b5fd" stroke-width="0.5" fill="none" opacity="0.35"/>
          <path d="M242 153 Q252 148, 262 152" stroke="#c4b5fd" stroke-width="0.5" fill="none" opacity="0.35"/>
        </g>

        <!-- AI label -->
        <text x="240" y="178" text-anchor="middle" fill="#c4b5fd" font-size="8" font-weight="700" letter-spacing="2" opacity="0.7">AI ENGINE</text>

        <!-- Scan beam (activates at stage 3+) -->
        <rect v-if="stage >= 3" x="230" y="165" width="20" height="115" rx="10" fill="url(#scanBeam)" class="scan-beam" opacity="0.5"/>
      </g>

      <!-- === FLOATING MEDICAL CARDS === -->
      <!-- AI Diagnosis -->
      <g class="float-card" style="--card-delay:0s; --card-float:5s; --card-radius:130px; --card-angle:0deg">
        <rect x="80" y="130" width="56" height="32" rx="8" fill="#0c4a6e" opacity="0.4" stroke="#06b6d4" stroke-width="0.5" stroke-opacity="0.3" filter="url(#cardGlow)"/>
        <text x="108" y="145" text-anchor="middle" fill="#67e8f9" font-size="6" font-weight="600">AI Diagnosis</text>
        <text x="108" y="155" text-anchor="middle" fill="#22d3ee" font-size="5" opacity="0.6">Analyzing...</text>
      </g>

      <!-- Doctor Recommendation -->
      <g class="float-card" style="--card-delay:0.6s; --card-float:5.5s; --card-radius:145px; --card-angle:60deg">
        <rect x="350" y="110" width="56" height="32" rx="8" fill="#0c4a6e" opacity="0.4" stroke="#8b5cf6" stroke-width="0.5" stroke-opacity="0.3" filter="url(#cardGlow)"/>
        <text x="378" y="125" text-anchor="middle" fill="#c4b5fd" font-size="5.5" font-weight="600">Doctor</text>
        <text x="378" y="135" text-anchor="middle" fill="#a78bfa" font-size="5" opacity="0.6">Recommended</text>
      </g>

      <!-- Symptoms Analysis -->
      <g class="float-card" style="--card-delay:1.2s; --card-float:4.8s; --card-radius:120px; --card-angle:120deg">
        <rect x="75" y="250" width="52" height="30" rx="8" fill="#0c4a6e" opacity="0.4" stroke="#06b6d4" stroke-width="0.5" stroke-opacity="0.3" filter="url(#cardGlow)"/>
        <text x="101" y="264" text-anchor="middle" fill="#67e8f9" font-size="5.5" font-weight="600">Symptoms</text>
        <text x="101" y="273" text-anchor="middle" fill="#22d3ee" font-size="5" opacity="0.6">Analysis</text>
      </g>

      <!-- Heart Rate -->
      <g class="float-card" style="--card-delay:1.8s; --card-float:5.2s; --card-radius:140px; --card-angle:180deg">
        <rect x="365" y="240" width="52" height="30" rx="8" fill="#0c4a6e" opacity="0.4" stroke="#f43f5e" stroke-width="0.5" stroke-opacity="0.3" filter="url(#cardGlow)"/>
        <text x="391" y="254" text-anchor="middle" fill="#fda4af" font-size="5.5" font-weight="600">Heart Rate</text>
        <text x="391" y="263" text-anchor="middle" fill="#fb7185" font-size="5" opacity="0.6">72 BPM</text>
      </g>

      <!-- Prescription -->
      <g class="float-card" style="--card-delay:2.4s; --card-float:4.5s; --card-radius:115px; --card-angle:240deg">
        <rect x="100" y="185" width="48" height="28" rx="8" fill="#0c4a6e" opacity="0.4" stroke="#10b981" stroke-width="0.5" stroke-opacity="0.3" filter="url(#cardGlow)"/>
        <text x="124" y="198" text-anchor="middle" fill="#6ee7b7" font-size="5.5" font-weight="600">Rx</text>
        <text x="124" y="207" text-anchor="middle" fill="#34d399" font-size="5" opacity="0.6">Ready</text>
      </g>

      <!-- Appointment -->
      <g class="float-card" style="--card-delay:3s; --card-float:5.8s; --card-radius:135px; --card-angle:300deg">
        <rect x="340" y="175" width="52" height="28" rx="8" fill="#0c4a6e" opacity="0.4" stroke="#f59e0b" stroke-width="0.5" stroke-opacity="0.3" filter="url(#cardGlow)"/>
        <text x="366" y="188" text-anchor="middle" fill="#fcd34d" font-size="5.5" font-weight="600">Appointment</text>
        <text x="366" y="197" text-anchor="middle" fill="#fbbf24" font-size="5" opacity="0.6">Scheduled</text>
      </g>

      <!-- === DOCTOR === -->
      <g class="doctor-float" style="transform-origin:330px 260px" :class="{ 'doctor-visible': stage >= 5 }">
        <!-- Doctor body -->
        <rect x="320" y="245" width="18" height="28" rx="4" fill="#e0f2fe" opacity="0.6"/>
        <!-- Head -->
        <circle cx="329" cy="239" r="7" fill="#e0f2fe" opacity="0.7"/>
        <!-- Stethoscope -->
        <path d="M324 252 Q320 258, 324 262" stroke="#06b6d4" stroke-width="1" fill="none" opacity="0.6"/>
        <!-- Tablet -->
        <rect x="338" y="252" width="10" height="14" rx="2" fill="#0c4a6e" stroke="#06b6d4" stroke-width="0.5" opacity="0.6"/>
        <rect x="339" y="254" width="8" height="4" rx="1" fill="#06b6d4" opacity="0.3"/>
        <rect x="339" y="260" width="8" height="2" rx="0.5" fill="#22d3ee" opacity="0.2"/>
      </g>

      <!-- === AMBULANCE === -->
      <g class="ambulance-drive" :class="{ 'ambulance-arrived': stage >= 1 }">
        <!-- Body -->
        <rect x="140" y="340" width="50" height="20" rx="4" fill="#fef2f2" opacity="0.7" stroke="#f87171" stroke-width="0.5" stroke-opacity="0.4"/>
        <!-- Cabin -->
        <path d="M140 340 L132 340 L128 350 L140 350Z" fill="#fef2f2" opacity="0.6"/>
        <!-- Cross -->
        <rect x="155" y="344" width="4" height="10" rx="1" fill="#ef4444" opacity="0.7"/>
        <rect x="151" y="347" width="12" height="4" rx="1" fill="#ef4444" opacity="0.7"/>
        <!-- Wheels -->
        <circle cx="138" cy="362" r="4" fill="#334155" opacity="0.6"/>
        <circle cx="170" cy="362" r="4" fill="#334155" opacity="0.6"/>
        <circle cx="138" cy="362" r="1.5" fill="#64748b" opacity="0.5"/>
        <circle cx="170" cy="362" r="1.5" fill="#64748b" opacity="0.5"/>
        <!-- Siren -->
        <rect x="130" y="336" width="8" height="4" rx="2" fill="#ef4444" opacity="0.6" class="siren-blink"/>
        <!-- Light beam -->
        <ellipse cx="128" cy="342" rx="20" ry="8" fill="#ef4444" opacity="0.06" class="siren-blink"/>
      </g>

      <!-- === NEURAL NETWORK LINES === -->
      <g class="neural-lines" opacity="0.2">
        <line x1="240" y1="170" x2="240" y2="210" stroke="#8b5cf6" stroke-width="0.6" stroke-dasharray="3 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" repeatCount="indefinite"/>
        </line>
        <line x1="108" y1="162" x2="200" y2="220" stroke="#06b6d4" stroke-width="0.4" stroke-dasharray="2 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="2.5s" repeatCount="indefinite"/>
        </line>
        <line x1="378" y1="142" x2="290" y2="220" stroke="#8b5cf6" stroke-width="0.4" stroke-dasharray="2 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="2.8s" repeatCount="indefinite"/>
        </line>
        <line x1="101" y1="280" x2="200" y2="260" stroke="#06b6d4" stroke-width="0.4" stroke-dasharray="2 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="3s" repeatCount="indefinite"/>
        </line>
        <line x1="391" y1="270" x2="290" y2="260" stroke="#f43f5e" stroke-width="0.4" stroke-dasharray="2 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="2.2s" repeatCount="indefinite"/>
        </line>
      </g>

      <!-- === FLOATING PARTICLES === -->
      <g class="particles-layer">
        <circle cx="60" cy="120" r="1.5" fill="#22d3ee" opacity="0.5" class="particle-drift" style="--pd:0s"/>
        <circle cx="420" cy="100" r="1" fill="#8b5cf6" opacity="0.4" class="particle-drift" style="--pd:1s"/>
        <circle cx="50" cy="300" r="1.2" fill="#06b6d4" opacity="0.4" class="particle-drift" style="--pd:2s"/>
        <circle cx="430" cy="320" r="1" fill="#22d3ee" opacity="0.35" class="particle-drift" style="--pd:0.5s"/>
        <circle cx="180" cy="80" r="1.5" fill="#a78bfa" opacity="0.4" class="particle-drift" style="--pd:1.5s"/>
        <circle cx="300" cy="380" r="1.2" fill="#06b6d4" opacity="0.35" class="particle-drift" style="--pd:2.5s"/>
        <circle cx="380" cy="60" r="1" fill="#22d3ee" opacity="0.4" class="particle-drift" style="--pd:3s"/>
        <circle cx="100" cy="360" r="1.3" fill="#8b5cf6" opacity="0.3" class="particle-drift" style="--pd:0.8s"/>
        <circle cx="440" cy="200" r="1" fill="#06b6d4" opacity="0.4" class="particle-drift" style="--pd:1.8s"/>
        <circle cx="30" cy="200" r="1.2" fill="#22d3ee" opacity="0.35" class="particle-drift" style="--pd:2.2s"/>
      </g>

      <!-- === STAGE INDICATOR DOTS === -->
      <g transform="translate(200, 395)">
        <circle v-for="i in 6" :key="i" :cx="(i - 1) * 16" cy="0" r="2.5"
          :fill="stage >= i ? '#06b6d4' : '#334155'"
          :opacity="stage >= i ? 0.8 : 0.3"
          class="transition-all duration-500"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Orbital rings */
.orbital-ring-cw {
  animation: orbit-cw 25s linear infinite;
}
.orbital-ring-ccw {
  animation: orbit-ccw 30s linear infinite;
}
.orbital-ring-cw-slow {
  animation: orbit-cw 40s linear infinite;
}
@keyframes orbit-cw {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes orbit-ccw {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

/* Hospital float */
.hospital-float {
  animation: hospital-bob 6s ease-in-out infinite;
}
@keyframes hospital-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* AI Brain float */
.ai-brain-float {
  animation: ai-bob 4s ease-in-out infinite;
  transition: opacity 0.8s ease;
}
.ai-brain-float:not(.ai-active) {
  opacity: 0.5;
}
.ai-brain-float.ai-active {
  opacity: 1;
}
@keyframes ai-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Glow breathe */
.glow-breathe {
  animation: breathe 3s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

/* Scan beam */
.scan-beam {
  animation: scan-pulse 2s ease-in-out infinite;
}
@keyframes scan-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* Floating cards orbit */
.float-card {
  animation: card-orbit var(--card-float, 5s) ease-in-out infinite;
  animation-delay: var(--card-delay, 0s);
}
@keyframes card-orbit {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-4px) rotate(1deg); }
  50% { transform: translateY(-8px) rotate(0deg); }
  75% { transform: translateY(-4px) rotate(-1deg); }
}

/* Doctor */
.doctor-float {
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 1s ease, transform 1s ease;
}
.doctor-float.doctor-visible {
  opacity: 1;
  transform: translateX(0);
}

/* Ambulance */
.ambulance-drive {
  animation: ambulance-move 4s ease-in-out infinite;
}
@keyframes ambulance-move {
  0% { transform: translateX(-30px); }
  30% { transform: translateX(0); }
  70% { transform: translateX(0); }
  100% { transform: translateX(-30px); }
}

/* Siren */
.siren-blink {
  animation: siren 1.2s ease-in-out infinite;
}
@keyframes siren {
  0%, 45%, 55%, 100% { opacity: 0.3; }
  50% { opacity: 0.9; }
}

/* Particles */
.particle-drift {
  animation: drift 6s ease-in-out infinite;
  animation-delay: var(--pd, 0s);
}
@keyframes drift {
  0%, 100% { transform: translate(0, 0); opacity: 0.3; }
  50% { transform: translate(5px, -8px); opacity: 0.6; }
}

/* Pulse slow */
.animate-pulse-slow {
  animation: pulse-slow 6s ease-in-out infinite;
}
@keyframes pulse-slow {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}
@keyframes float-slow {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(10px, -10px); }
}
</style>
