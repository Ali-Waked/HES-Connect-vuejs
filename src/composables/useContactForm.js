import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as contactService from '@/services/contactService';

export function useContactForm() {
  const { t } = useI18n();

  const form = reactive({
    name: '',
    email: '',
    message: '',
  });

  const errors = ref({});
  const apiError = ref(null);
  const submitting = ref(false);
  const success = ref(false);

  const NAME_MAX = 100;
  const EMAIL_MAX = 200;
  const MESSAGE_MAX = 2000;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    const next = {};

    if (!form.name.trim()) {
      next.name = t('common.required');
    } else if (form.name.trim().length > NAME_MAX) {
      next.name = t('contactPage.maxChars', { max: NAME_MAX });
    }

    if (!form.email.trim()) {
      next.email = t('common.required');
    } else if (!emailPattern.test(form.email.trim())) {
      next.email = t('common.invalidEmail');
    } else if (form.email.trim().length > EMAIL_MAX) {
      next.email = t('contactPage.maxChars', { max: EMAIL_MAX });
    }

    if (!form.message.trim()) {
      next.message = t('common.required');
    } else if (form.message.trim().length > MESSAGE_MAX) {
      next.message = t('contactPage.maxChars', { max: MESSAGE_MAX });
    }

    errors.value = next;
    return Object.keys(next).length === 0;
  }

  function clearFieldError(field) {
    if (errors.value[field]) {
      const next = { ...errors.value };
      delete next[field];
      errors.value = next;
    }
  }

  async function submit() {
    success.value = false;
    apiError.value = null;

    if (!validate()) return;

    submitting.value = true;
    try {
      await contactService.submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      success.value = true;
      form.name = '';
      form.email = '';
      form.message = '';
      errors.value = {};
    } catch (err) {
      if (err.response?.data?.errors) {
        const serverErrors = {};
        for (const [field, messages] of Object.entries(err.response.data.errors)) {
          serverErrors[field] = Array.isArray(messages) ? messages[0] : messages;
        }
        errors.value = serverErrors;
      } else {
        apiError.value = err.response?.data?.message || t('contactPage.errorGeneric');
      }
    } finally {
      submitting.value = false;
    }
  }

  return {
    form,
    errors,
    apiError,
    submitting,
    success,
    validate,
    clearFieldError,
    submit,
    NAME_MAX,
    EMAIL_MAX,
    MESSAGE_MAX,
  };
}
