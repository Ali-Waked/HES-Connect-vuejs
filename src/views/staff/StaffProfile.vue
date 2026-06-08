<template>
  <div class="animate-fade-in space-y-6">
    <div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">My Profile</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400">Manage your personal information and security</p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-64 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Personal Info</h3>
          <div class="flex flex-col items-center mb-6">
            <AvatarInitial :name="store.currentUser.name" size="lg" />
            <button class="mt-2 text-sm text-brand-primary font-semibold" @click="mockPhoto">Change Photo</button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Name</label>
              <input v-model="form.name" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Email</label>
              <input :value="store.currentUser.email" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm" readonly />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Phone</label>
                <input v-model="form.phone" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Gender</label>
                <select v-model="form.gender" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Birth Date</label>
                <input type="date" v-model="form.birthDate" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Address</label>
                <input v-model="form.address" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
              </div>
            </div>
            <div v-if="isDoctorOrNurse">
              <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Specialization</label>
              <input v-model="form.specialization" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
            </div>
            <div v-if="isDoctorOrNurse">
              <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Experience (years)</label>
              <input type="number" v-model.number="form.experience" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
            </div>
            <div v-if="isDoctorOrNurse">
              <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Bio</label>
              <textarea v-model="form.bio" rows="3" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm"></textarea>
            </div>
            <div v-if="isDoctorOrNurse">
              <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Consultation Fee ($)</label>
              <input type="number" v-model.number="form.fee" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
            </div>
          </div>
          <button class="mt-6 rounded-md bg-brand-primary px-6 py-2.5 text-sm text-white" @click="saveProfile">Save Changes</button>
        </section>

        <section class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Security</h3>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Current Password</label>
              <input type="password" v-model="password.current" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">New Password</label>
              <input type="password" v-model="password.newPass" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Confirm Password</label>
              <input type="password" v-model="password.confirm" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm" />
            </div>
            <p v-if="passwordError" class="text-xs text-red-500">{{ passwordError }}</p>
            <button class="rounded-md border border-slate-200 dark:border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300" @click="updatePassword">Update Password</button>
          </div>

          <div class="mt-8 border-t border-slate-100 dark:border-slate-700 pt-6">
            <h4 class="font-bold text-slate-900 dark:text-slate-100 mb-4">Two-Factor Authentication</h4>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-700 dark:text-slate-300">Enable 2FA</span>
              <button class="h-6 w-11 rounded-full transition" :class="twoFactor ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'" @click="twoFactor = !twoFactor">
                <div class="h-5 w-5 rounded-full bg-white shadow-sm transition-transform" :class="twoFactor ? 'translate-x-[22px]' : 'translate-x-[2px]'"></div>
              </button>
            </div>
            <div v-if="twoFactor" class="mt-4 rounded-lg border border-slate-100 dark:border-slate-700 p-4 text-center">
              <div class="mx-auto h-24 w-24 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">QR Code Placeholder</div>
              <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Scan with your authenticator app</p>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/useStaffStore'
import AvatarInitial from '@/components/staff/shared/AvatarInitial.vue'

const store = useStaffStore()
const loading = ref(true)

const isDoctorOrNurse = computed(() => ['doctor', 'nurse'].includes(store.currentUser.role))

const form = reactive({
  name: store.currentUser.name,
  phone: store.currentUser.phone || '',
  gender: store.currentUser.gender || 'male',
  birthDate: store.currentUser.birthDate || '',
  address: store.currentUser.address || '',
  specialization: store.currentUser.specialization || '',
  experience: store.currentUser.experience || 0,
  bio: store.currentUser.bio || '',
  fee: store.currentUser.fee || 0
})

const password = reactive({ current: '', newPass: '', confirm: '' })
const passwordError = ref('')
const twoFactor = ref(false)

function mockPhoto() { store.showToast('Photo updated', 'success') }

function saveProfile() {
  store.updateProfile({ ...form })
  store.showToast('Profile saved', 'success')
}

function updatePassword() {
  passwordError.value = ''
  if (!password.current || !password.newPass || !password.confirm) { passwordError.value = 'All password fields required'; return }
  if (password.newPass !== password.confirm) { passwordError.value = 'Passwords do not match'; return }
  store.showToast('Password updated', 'success')
  password.current = ''; password.newPass = ''; password.confirm = ''
}

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })
</script>
