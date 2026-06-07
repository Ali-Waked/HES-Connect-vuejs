<script setup>
import { reactive, ref } from 'vue';
import { useProfile } from '../../composables/useProfile';

const props = defineProps({
  saving: { type: Boolean, default: false }
});

const emit = defineEmits(['save-password']);
const { validatePassword } = useProfile(ref({}));
const errors = ref({});
const twoFactorEnabled = ref(false);

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const sessions = [
  { id: 1, device: 'Chrome on Windows', location: 'Gaza City, Palestine', seen: 'Current session' },
  { id: 2, device: 'Safari on iPhone', location: 'Riyadh, Saudi Arabia', seen: 'Jun 6, 2026, 9:14 PM' }
];

function resetForm() {
  form.currentPassword = '';
  form.newPassword = '';
  form.confirmPassword = '';
}

async function submit() {
  errors.value = validatePassword(form);
  if (Object.keys(errors.value).length) return;

  emit('save-password', { ...form });
  resetForm();
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">Change Password</h2>
        <p class="mt-1 text-sm text-slate-500">Use a strong password that is not used elsewhere.</p>
      </div>

      <form class="mt-6 grid grid-cols-1 gap-5" @submit.prevent="submit">
        <label class="space-y-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Password</span>
          <input v-model="form.currentPassword" type="password" autocomplete="current-password" class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none transition " />
          <span v-if="errors.currentPassword" class="text-xs font-semibold text-rose-600">{{ errors.currentPassword }}</span>
        </label>

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">New Password</span>
            <input v-model="form.newPassword" type="password" autocomplete="new-password" class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none transition " />
            <span v-if="errors.newPassword" class="text-xs font-semibold text-rose-600">{{ errors.newPassword }}</span>
          </label>

          <label class="space-y-2">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm Password</span>
            <input v-model="form.confirmPassword" type="password" autocomplete="new-password" class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none transition " />
            <span v-if="errors.confirmPassword" class="text-xs font-semibold text-rose-600">{{ errors.confirmPassword }}</span>
          </label>
        </div>

        <div class="flex justify-end border-t border-slate-100 pt-5">
          <button type="submit" :disabled="props.saving" class="h-10 rounded-lg bg-brand-primary px-6 text-sm font-semibold text-white transition hover:bg-brand-primary-hover disabled:opacity-60">
            {{ props.saving ? 'Updating...' : 'Update Password' }}
          </button>
        </div>
      </form>
    </section>

    <aside class="space-y-6">
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-sm font-semibold text-slate-950">Two Factor Authentication</h3>
            <p class="mt-1 text-sm text-slate-500">UI ready for backend activation.</p>
          </div>
          <button
            type="button"
            class="relative h-6 w-11 rounded-full transition"
            :class="twoFactorEnabled ? 'bg-brand-primary' : 'bg-slate-200'"
            @click="twoFactorEnabled = !twoFactorEnabled"
          >
            <span class="absolute top-1 h-4 w-4 rounded-full bg-white transition" :class="twoFactorEnabled ? 'left-6' : 'left-1'"></span>
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-950">Active Sessions</h3>
        <div class="mt-4 space-y-3">
          <div v-for="session in sessions" :key="session.id" class="rounded-xl border border-slate-100 p-3">
            <p class="text-sm font-semibold text-slate-800">{{ session.device }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ session.location }}</p>
            <p class="mt-2 text-xs font-semibold text-brand-primary">{{ session.seen }}</p>
          </div>
        </div>
      </section>
    </aside>
  </div>
</template>
