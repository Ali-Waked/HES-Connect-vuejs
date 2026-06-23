<template>
  <DoctorHome v-if="view === 'doctor'" />
  <NurseHome v-else-if="view === 'nurse'" />
  <ManagerHome v-else-if="view === 'hospital_manager'" />
  <PharmacistHome v-else-if="view === 'pharmacist'" />
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import DoctorHome from './dashboard/DoctorHome.vue'
import NurseHome from './dashboard/NurseHome.vue'
import ManagerHome from './dashboard/ManagerHome.vue'
import PharmacistHome from './dashboard/PharmacistHome.vue'

const authStore = useAuthStore()
const view = computed(() => authStore.user?.dashboard_route?.split('/')[1] || '')
</script>
