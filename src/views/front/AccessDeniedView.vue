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
        <div class="w-16 h-16 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <AuthHeader
          title="Access denied"
          :showLogo="false"
        >
          <p class="text-sm text-landing-muted leading-relaxed -mt-4">
            You don't have permission to access this page. If you believe this is an error, please contact your administrator.
          </p>
        </AuthHeader>

        <div class="space-y-3">
          <AuthButton
            full-width
            size="lg"
            @click="router.push('/')"
          >
            Go to Home
          </AuthButton>

          <AuthButton
            variant="secondary"
            full-width
            @click="router.back()"
          >
            Go Back
          </AuthButton>
        </div>
      </div>
    </AuthCard>
  </AuthLayout>
</template>
