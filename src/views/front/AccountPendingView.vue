<script setup>
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthCard from '@/components/auth/AuthCard.vue'
import AuthHeader from '@/components/auth/AuthHeader.vue'
import AuthButton from '@/components/auth/AuthButton.vue'

const router = useRouter()
</script>

<template>
  <AuthLayout variant="centered">
    <AuthCard>
      <div class="text-center">
        <div class="w-16 h-16 rounded-full bg-warning-light/50 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <AuthHeader
          title="Account pending approval"
          :showLogo="false"
        >
          <p class="text-sm text-landing-muted leading-relaxed -mt-4">
            Your account has been created and is awaiting approval from an administrator. You'll receive an email once your account is activated.
          </p>
        </AuthHeader>

        <div class="bg-warning-light border border-warning/20 rounded-xl p-4 mb-6 text-left">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-warning shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm font-semibold text-warning">What happens next?</p>
              <ul class="mt-2 text-xs text-warning/80 space-y-1">
                <li>1. An administrator will review your account</li>
                <li>2. You'll receive an email when approved</li>
                <li>3. You can then sign in and access the platform</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <AuthButton
            variant="secondary"
            full-width
            @click="router.push('/contact')"
          >
            Contact Support
          </AuthButton>

          <router-link
            to="/login"
            class="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to sign in
          </router-link>
        </div>
      </div>
    </AuthCard>
  </AuthLayout>
</template>
