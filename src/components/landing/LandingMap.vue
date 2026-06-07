<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
  facilities: { type: Array, default: () => [] }
});

const mapContainer = ref(null);
let map = null;
let markersLayer = null;

const MARKER_COLORS = {
  hospital: '#ef4444',
  clinic: '#3b82f6',
  pharmacy: '#22c55e',
  medical_point: '#f97316'
};

function createIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
}

function initMap() {
  if (!mapContainer.value || map) return;

  map = L.map(mapContainer.value, {
    center: [31.45, 34.40],
    zoom: 11,
    scrollWheelZoom: false,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  updateMarkers();
}

function updateMarkers() {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  props.facilities.forEach((f) => {
    const color = MARKER_COLORS[f.facility_type] || '#027a75';
    const marker = L.marker([f.latitude, f.longitude], { icon: createIcon(color) });
    marker.bindPopup(`<strong>${f.name}</strong><br><span style="text-transform:capitalize">${f.facility_type?.replace('_', ' ')}</span>`);
    markersLayer.addLayer(marker);
  });
}

onMounted(() => {
  setTimeout(initMap, 100);
});

watch(() => props.facilities, updateMarkers, { deep: true });

onUnmounted(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div class="relative w-full h-full min-h-[320px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
    <div ref="mapContainer" class="absolute inset-0 z-0"></div>
    <div class="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-xs shadow-sm border border-slate-200">
      <div class="flex flex-wrap gap-x-3 gap-y-1">
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> Hospital</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Clinic</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> Pharmacy</span>
        <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Medical Point</span>
      </div>
    </div>
  </div>
</template>

<style>
.custom-marker { background: transparent !important; border: none !important; }
.leaflet-container { font-family: inherit; }
</style>
