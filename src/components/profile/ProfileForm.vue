<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AuthInput from '@/components/auth/AuthInput.vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import AuthLabel from '@/components/auth/AuthLabel.vue'
import { getCitiesLookup } from '@/services/cityService'

const { locale } = useI18n()

const props = defineProps({
  profile: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['save'])

const cities = ref([])
const loadingCities = ref(false)

const form = reactive({
  name_en: '',
  name_ar: '',
  phone: '',
  address: '',
  gender: '',
  birth_date: '',
  city_id: '',
  locale: 'en',
})

function resolveName(obj) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj[locale.value] || obj.en || obj.ar || ''
}

function syncForm() {
  if (!props.profile) return
  const name = props.profile.name
  if (typeof name === 'object' && name !== null) {
    form.name_en = name.en || ''
    form.name_ar = name.ar || ''
  } else {
    form.name_en = name || ''
    form.name_ar = ''
  }
  form.phone = props.profile.phone || ''
  form.address = props.profile.address || ''
  form.gender = props.profile.gender || ''
  form.birth_date = props.profile.birth_date || ''
  form.city_id = props.profile.city_id || ''
  form.locale = props.profile.locale || 'en'
}

watch(() => props.profile, syncForm, { immediate: true, deep: true })

onMounted(async () => {
  loadingCities.value = true
  try {
    const { data } = await getCitiesLookup()
    cities.value = data.data || data || []
  } catch {
    cities.value = []
  } finally {
    loadingCities.value = false
  }
})

function fieldError(field) {
  return props.errors?.[field]?.[0] || ''
}

function handleSubmit() {
  emit('save', {
    ...form,
    name: { en: form.name_en, ar: form.name_ar },
  })
}
</script>

<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <!-- Section Header -->
    <div class="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your personal details and preferences.</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="p-6 sm:p-8 space-y-6">
      <!-- Names -->
      <div>
        <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Full Name</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthInput
            v-model="form.name_en"
            id="name_en"
            name="name_en"
            label="English"
            placeholder="John Doe"
            :error="fieldError('name.en')"
          />
          <AuthInput
            v-model="form.name_ar"
            id="name_ar"
            name="name_ar"
            label="Arabic"
            dir="rtl"
            placeholder="جون دو"
            :error="fieldError('name.ar')"
          />
        </div>
      </div>

      <!-- Contact -->
      <div>
        <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Contact</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthInput
            v-model="form.phone"
            id="phone"
            name="phone"
            label="Phone"
            placeholder="+970 59-XXX-XXXX"
            :error="fieldError('phone')"
          />

          <div>
            <AuthLabel for="locale" label="Language" />
            <select
              v-model="form.locale"
              id="locale"
              name="locale"
              class="block w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-slate-100 dark:hover:bg-slate-700/50"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Personal -->
      <div>
        <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Personal Details</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <AuthLabel for="gender" label="Gender" />
            <select
              v-model="form.gender"
              id="gender"
              name="gender"
              class="block w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-slate-100 dark:hover:bg-slate-700/50"
            >
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <p v-if="fieldError('gender')" class="mt-1.5 text-xs text-red-500">{{ fieldError('gender') }}</p>
          </div>

          <AuthInput
            v-model="form.birth_date"
            id="birth_date"
            name="birth_date"
            type="date"
            label="Birth Date"
            :error="fieldError('birth_date')"
          />

          <div>
            <AuthLabel for="city_id" label="City" />
            <select
              v-model="form.city_id"
              id="city_id"
              name="city_id"
              :disabled="loadingCities"
              class="block w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-slate-100 dark:hover:bg-slate-700/50 disabled:opacity-50"
            >
              <option value="" disabled>{{ loadingCities ? 'Loading cities...' : 'Select city' }}</option>
              <option v-for="city in cities" :key="city.uuid" :value="city.uuid">
                {{ resolveName(city.name) }}
              </option>
            </select>
            <p v-if="fieldError('city_id')" class="mt-1.5 text-xs text-red-500">{{ fieldError('city_id') }}</p>
          </div>
        </div>
      </div>

      <!-- Address -->
      <div>
        <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Address</p>
        <AuthInput
          v-model="form.address"
          id="address"
          name="address"
          label="Street Address"
          placeholder="Your address"
          :error="fieldError('address')"
        />
      </div>

      <!-- Submit -->
      <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <AuthButton type="submit" :loading="saving" size="lg">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </AuthButton>
      </div>
    </form>
  </div>
</template>
