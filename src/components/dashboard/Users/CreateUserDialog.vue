<script setup>
import { reactive, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '../../../stores/dashboard'
import BaseDialog from '../global/BaseDialog.vue'
import { createUser } from '../../../services/userService'
import { getRoles } from '../../../services/roleService'
import { resolveTranslatedValue } from '../../../utils/locale'

const props = defineProps({
  show: { type: Boolean, required: true }
})

const emit = defineEmits(['close', 'created'])
const { t: $t } = useI18n()
const store = useDashboardStore()

function roleName(role) {
  const lang = localStorage.getItem('lang') || 'en'
  return resolveTranslatedValue(role.name, lang)
}

const form = reactive({
  name: { en: '', ar: '' },
  email: '',
  role_id: ''
})

const errors = reactive({})
const saving = ref(false)
const roles = ref([])
const rolesLoading = ref(false)
const rolesError = ref(false)

async function fetchRoles() {
  rolesLoading.value = true
  rolesError.value = false
  try {
    const { data } = await getRoles({ per_page: 1000 })
    roles.value = data.data || []
  } catch {
    rolesError.value = true
    store.addToast('Failed to load roles', 'error')
  } finally {
    rolesLoading.value = false
  }
}

watch(() => props.show, (val) => {
  if (val) {
    form.name = { en: '', ar: '' }
    form.email = ''
    form.role_id = ''
    Object.keys(errors).forEach(k => delete errors[k])
    fetchRoles()
  }
})

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  let valid = true

  if (!form.name.en.trim()) {
    errors['name.en'] = $t('common.required')
    valid = false
  }
  if (!form.name.ar.trim()) {
    errors['name.ar'] = $t('common.required')
    valid = false
  }
  if (!form.email.trim()) {
    errors['email'] = $t('common.required')
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors['email'] = $t('common.invalid_email') || 'Invalid email format'
    valid = false
  }
  if (!form.role_id) {
    errors['role_id'] = $t('common.required')
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validate()) return

  saving.value = true
  Object.keys(errors).forEach(k => delete errors[k])

  try {
    await createUser({
      name: {
        en: form.name.en.trim(),
        ar: form.name.ar.trim()
      },
      email: form.email.trim(),
      role_id: form.role_id
    })
    store.addToast($t('users.user_created') || 'User created successfully')
    emit('created')
    emit('close')
  } catch (err) {
    if (err.response?.status === 422 && err.response.data?.errors) {
      const serverErrors = err.response.data.errors
      for (const key in serverErrors) {
        errors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key]
      }
    } else {
      const msg = err.response?.data?.message || 'Failed to create user'
      store.addToast(msg, 'error')
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseDialog
    :show="show"
    :title="$t('users.create_user') || 'Create User'"
    size="md"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="userNameEn">
            {{ $t('users.name_en') || 'Name (English)' }} *
          </label>
          <input
            id="userNameEn"
            type="text"
            class="input-base"
            dir="ltr"
            :placeholder="$t('users.name_en_placeholder') || 'Enter name in English'"
            v-model="form.name.en"
          />
          <p v-if="errors['name.en']" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors['name.en'] }}</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="userNameAr">
            {{ $t('users.name_ar') || 'Name (Arabic)' }} *
          </label>
          <input
            id="userNameAr"
            type="text"
            class="input-base text-right"
            dir="rtl"
            :placeholder="$t('users.name_ar_placeholder') || 'أدخل الاسم بالعربية'"
            v-model="form.name.ar"
          />
          <p v-if="errors['name.ar']" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors['name.ar'] }}</p>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="userEmail">
          {{ $t('users.email') || 'Email' }} *
        </label>
        <input
          id="userEmail"
          type="email"
          class="input-base"
          dir="ltr"
          :placeholder="$t('users.email_placeholder') || 'Enter email address'"
          v-model="form.email"
        />
        <p v-if="errors['email']" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors['email'] }}</p>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-400" for="userRole">
          {{ $t('users.role') || 'Role' }} *
        </label>
        <select
          id="userRole"
          class="input-base appearance-none"
          v-model="form.role_id"
          :disabled="rolesLoading"
        >
          <option value="" disabled>
            {{ rolesLoading ? ($t('common.loading') || 'Loading...') : ($t('users.select_role') || 'Select a role') }}
          </option>
          <option
            v-for="role in roles"
            :key="role.uuid"
            :value="role.uuid"
          >
            {{ roleName(role) }}
          </option>
        </select>
        <p v-if="rolesError" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">
          {{ $t('users.roles_load_error') || 'Failed to load roles' }}
        </p>
        <p v-if="errors['role_id']" class="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{{ errors['role_id'] }}</p>
      </div>
    </form>

    <template #footer>
      <button
        type="button"
        @click="$emit('close')"
        class="py-2.5 px-6 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold rounded-lg transition cursor-pointer"
      >
        {{ $t('common.cancel') }}
      </button>
      <button
        type="submit"
        :disabled="saving || rolesLoading"
        class="py-2.5 px-8 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-md shadow-brand-primary/15 transition inline-flex items-center gap-2 cursor-pointer"
        @click="handleSubmit"
      >
        <svg v-if="saving" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        {{ $t('users.create_user') || 'Create User' }}
      </button>
    </template>
  </BaseDialog>
</template>
