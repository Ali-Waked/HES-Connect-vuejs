<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useDashboardStore } from '../../stores/dashboard';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const name = ref(authStore.user?.name || '');
const saving = ref(false);

function handleSave() {
  if (!name.value.trim()) return;
  saving.value = true;
  authStore.updateProfile({ name: name.value.trim() });
  dashboardStore.addToast('Settings saved successfully', 'success');
  saving.value = false;
}
</script>

<template>
  <div class="space-y-6 animate-fade-in max-w-xl">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
      <p class="text-sm text-slate-500 mt-1">Manage your account preferences</p>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
      <div class="flex items-center gap-4 pb-5 border-b border-slate-100">
        <div class="w-14 h-14 bg-brand-primary text-white font-bold rounded-full flex items-center justify-center text-xl">
          {{ authStore.user?.initials }}
        </div>
        <div>
          <p class="text-base font-bold text-slate-900">{{ authStore.user?.name }}</p>
          <p class="text-sm text-slate-500">{{ authStore.user?.role }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-semibold text-slate-700 mb-1.5">Display name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none transition"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
          <input
            id="email"
            :value="authStore.user?.email"
            type="email"
            disabled
            class="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Sign-in provider</label>
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize"
            :class="authStore.user?.provider === 'google' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'"
          >
            {{ authStore.user?.provider || 'email' }}
          </span>
        </div>
      </div>

      <button
        class="inline-flex items-center gap-2 py-2.5 px-5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-60"
        :disabled="saving || !name.trim()"
        @click="handleSave"
      >
        Save changes
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
</style>
