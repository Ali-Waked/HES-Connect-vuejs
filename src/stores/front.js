import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFrontStore = defineStore('front', () => {
  const landingInfo = ref({
    title: 'Gaza Health Ecosystem Portal',
    description: 'Connecting healthcare providers, facilities, and departments to streamline resource allocation and medical care delivery across the Gaza Strip.',
    version: '1.0.0-Beta'
  });

  return {
    landingInfo
  };
});
