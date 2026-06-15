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
        <div class="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <AuthHeader
          title="Email verified successfully"
          :showLogo="false"
        >
          <p class="text-sm text-slate-500 leading-relaxed -mt-4">
            Your email has been verified. You can now access all features of your HES Connect account.
          </p>
        </AuthHeader>

        <AuthButton
          full-width
          size="lg"
          @click="router.push('/login')"
        >
          Continue to Sign In
        </AuthButton>
      </div>
    </AuthCard>
  </AuthLayout>
</template>
