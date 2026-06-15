import { ref, computed } from 'vue'

export function useFormField(options = {}) {
  const {
    initialValue = '',
    validate: validateFn,
    validateOnChange = false,
  } = options

  const value = ref(initialValue)
  const touched = ref(false)
  const error = ref('')
  const focused = ref(false)

  function validate() {
    if (validateFn) {
      const msg = validateFn(value.value)
      error.value = msg || ''
      return !msg
    }
    return true
  }

  function onBlur() {
    focused.value = false
    touched.value = true
    if (touched.value) validate()
  }

  function onFocus() {
    focused.value = true
  }

  function reset() {
    value.value = initialValue
    touched.value = false
    error.value = ''
    focused.value = false
  }

  if (validateOnChange) {
    const stop = function watchEffect() {
      if (touched.value) validate()
    }
  }

  const hasError = computed(() => touched.value && !!error.value)
  const isValid = computed(() => touched.value && !error.value && value.value)

  return {
    value,
    touched,
    error,
    focused,
    hasError,
    isValid,
    validate,
    onBlur,
    onFocus,
    reset,
  }
}
