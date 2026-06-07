import { computed } from 'vue';

export function useProfile(profileRef) {
  const roleLabel = computed(() => profileRef.value?.role || 'Super Admin');
  const statusLabel = computed(() => profileRef.value?.status || 'Active');

  function formatDateTime(value) {
    if (!value) return 'Not recorded';

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(value));
  }

  function validateProfile(form) {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.fullName?.trim()) errors.fullName = 'Full name is required.';
    if (!form.email?.trim()) errors.email = 'Email is required.';
    else if (!emailPattern.test(form.email)) errors.email = 'Enter a valid email address.';
    if (form.phone && form.phone.replace(/[^\d+]/g, '').length < 7) errors.phone = 'Enter a valid phone number.';
    if (form.gender && !['male', 'female'].includes(String(form.gender).toLowerCase())) errors.gender = 'Choose male or female.';

    return errors;
  }

  function validatePassword(form) {
    const errors = {};

    if (!form.currentPassword) errors.currentPassword = 'Current password is required.';
    if (!form.newPassword || form.newPassword.length < 8) errors.newPassword = 'Use at least 8 characters.';
    if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'Passwords do not match.';

    return errors;
  }

  return {
    roleLabel,
    statusLabel,
    formatDateTime,
    validateProfile,
    validatePassword
  };
}
