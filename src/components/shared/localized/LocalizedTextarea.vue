<script setup>
const props = defineProps({
  modelValue: { type: Object, default: () => ({ en: '', ar: '' }) },
  field: { type: String, required: true },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  rows: { type: Number, default: 4 },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const activeTab = defineModel('tab', { default: 'en' })

function updateLang(lang, value) {
  emit('update:modelValue', { ...props.modelValue, [lang]: value })
}
</script>

<template>
  <div class="localized-field">
    <div v-if="label" class="d-flex justify-content-between align-items-center mb-1">
      <label class="form-label mb-0">
        {{ label }}
        <span v-if="required" class="text-danger">*</span>
      </label>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-1 border-0 gap-1">
      <li class="nav-item">
        <button
          class="nav-link py-0 px-2 border-0"
          :class="activeTab === 'en' ? 'active fw-semibold' : 'text-muted'"
          @click="activeTab = 'en'"
          type="button"
        >English</button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link py-0 px-2 border-0"
          :class="activeTab === 'ar' ? 'active fw-semibold' : 'text-muted'"
          @click="activeTab = 'ar'"
          type="button"
        >العربية</button>
      </li>
    </ul>

    <textarea
      v-if="activeTab === 'en'"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :value="modelValue?.en ?? ''"
      @input="updateLang('en', $event.target.value)"
      :placeholder="placeholder || `${label} (EN)`"
      :disabled="disabled"
      :rows="rows"
    ></textarea>
    <textarea
      v-else
      class="form-control"
      :class="{ 'is-invalid': error && activeTab === 'ar' }"
      :value="modelValue?.ar ?? ''"
      @input="updateLang('ar', $event.target.value)"
      :placeholder="placeholder || `${label} (AR)`"
      :disabled="disabled"
      :rows="rows"
      dir="rtl"
    ></textarea>
    <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
  </div>
</template>

<style scoped>
.nav-tabs .nav-link {
  background: transparent;
  color: #6c757d;
  font-size: 0.8125rem;
  border-radius: 0;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}
.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-bottom: 2px solid #0d6efd;
  background: transparent;
}
.nav-tabs .nav-link:hover:not(.active) {
  color: #495057;
}
</style>
