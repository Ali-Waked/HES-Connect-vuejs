<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import AuthLayout from '../../components/auth/AuthLayout.vue';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const redirectTo = computed(() => route.query.redirect || '/admin/dashboard');

async function handleSubmit() {
  error.value = '';

  if (!email.value.trim() || !password.value) {
    error.value = 'Please enter your email and password.';
    return;
  }

  loading.value = true;
  try {
    authStore.loginWithEmail({
      email: email.value.trim(),
      password: password.value
    });
    router.push(redirectTo.value);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthLayout title="Sign in" subtitle="Access your healthcare management workspace.">
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div
        v-if="error"
        class="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700"
      >
        <svg class="w-4 h-4 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        {{ error }}
      </div>

      <GoogleSignInButton :redirect-to="redirectTo" @error="error = $event" />

      <div class="relative flex items-center py-1">
        <div class="grow border-t border-slate-200"></div>
        <span class="shrink-0 px-4 text-xs font-semibold uppercase text-slate-400">or</span>
        <div class="grow border-t border-slate-200"></div>
      </div>

      <div class="space-y-4">
        <div>
          <label for="email" class="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 "
          />
        </div>

        <div>
          <div class="mb-1.5 flex items-center justify-between gap-3">
            <label for="password" class="block text-sm font-semibold text-slate-700">Password</label>
            <button type="button" class="text-xs font-semibold text-slate-500 transition hover:text-brand-primary">Forgot password?</button>
          </div>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Enter your password"
              class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 "
            />
            <button
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              :title="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg v-else class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="flex h-11 w-full items-center justify-center rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Don't have an account?
      <router-link to="/register" class="font-semibold text-brand-primary transition hover:text-brand-primary-hover">
        Create one
      </router-link>
    </p>
  </AuthLayout>
</template>
