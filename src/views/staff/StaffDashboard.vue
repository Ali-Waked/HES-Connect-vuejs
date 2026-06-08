<template>
  <DoctorHome v-if="role === 'doctor'" />
  <NurseHome v-else-if="role === 'nurse'" />
  <ManagerHome v-else-if="role === 'hospital_manager'" />
  <PharmacistHome v-else-if="role === 'pharmacist'" />
</template>

<script setup>
import { computed } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import DoctorHome from './dashboard/DoctorHome.vue'
import NurseHome from './dashboard/NurseHome.vue'
import ManagerHome from './dashboard/ManagerHome.vue'
import PharmacistHome from './dashboard/PharmacistHome.vue'

const store = useStaffStore()
const role = computed(() => store.currentUser.role)
</script>
