<script setup>
import { ref, reactive, watch } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
import { useI18n } from 'vue-i18n';
import LocalizedInput from '@/components/shared/localized/LocalizedInput.vue';
import LocalizedTextarea from '@/components/shared/localized/LocalizedTextarea.vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  org: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const store = useDashboardStore();
const { t: $t } = useI18n();

const name = reactive({ en: '', ar: '' });
const description = reactive({ en: '', ar: '' });
const type = ref('');
const errors = reactive({ name: '', description: '' });

function validate() {
  let valid = true
  errors.name = ''
  errors.description = ''
  if (!name.en?.trim()) { errors.name = $t('common.required'); valid = false }
  if (!name.ar?.trim()) { errors.name = $t('common.required'); valid = false }
  return valid
}

watch(
  () => props.org,
  (newOrg) => {
    if (newOrg) {
      name.en = newOrg.name?.en || newOrg.name_en || ''
      name.ar = newOrg.name?.ar || newOrg.name_ar || ''
      description.en = newOrg.description?.en || newOrg.description_en || ''
      description.ar = newOrg.description?.ar || newOrg.description_ar || ''
      type.value = newOrg.type || ''
    } else {
      name.en = ''
      name.ar = ''
      description.en = ''
      description.ar = ''
      type.value = ''
    }
  },
  { immediate: true }
);

const submitForm = () => {
  if (!validate()) return
  const data = {
    name: { en: name.en, ar: name.ar },
    description: { en: description.en, ar: description.ar },
    type: type.value
  };

  if (props.org && props.org.id) {
    store.updateOrg(props.org.id, data);
  } else {
    store.addOrg(data);
  }
  emit('close');
};
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-slate-900/40/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-xl w-full max-w-[520px] shadow-2xl overflow-hidden border border-slate-200 animate-slide-up">
      <div class="p-5 px-6 border-b border-slate-100 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900">
          {{ org ? $t('organizations.edit') : $t('organizations.add') }}
        </h3>
        <button 
          class="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition"
          @click="$emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="submitForm">
        <div class="p-6 flex flex-col gap-4">
          <LocalizedInput v-model="name" field="name" :label="$t('organizations.name_en')" required :error="errors.name" />
          
          <LocalizedTextarea v-model="description" field="description" :label="$t('common.description')" :rows="3" />

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600" for="orgType">Type *</label>
            <select 
              id="orgType" 
              class="w-full p-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none transition cursor-pointer" 
              required 
              v-model="type"
            >
              <option value="" disabled>Select Organization Type</option>
              <option value="Private">Private</option>
              <option value="NGO">NGO</option>
              <option value="International">International</option>
              <option value="UN Agency">UN Agency</option>
              <option value="Government">Government</option>
            </select>
          </div>
        </div>

        <div class="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            type="button" 
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            @click="$emit('close')"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            type="submit" 
            class="inline-flex items-center justify-center py-2 px-4.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition cursor-pointer"
          >
            {{ org ? $t('common.save') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
