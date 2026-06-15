import { computed, ref, watch } from 'vue'

export function usePasswordStrength(passwordRef) {
  const levels = [
    { label: 'Very Weak', color: '#ef4444', width: '20%' },
    { label: 'Weak', color: '#f97316', width: '40%' },
    { label: 'Fair', color: '#eab308', width: '60%' },
    { label: 'Strong', color: '#22c55e', width: '80%' },
    { label: 'Very Strong', color: '#10b981', width: '100%' },
  ]

  const score = computed(() => {
    const pw = passwordRef.value || ''
    if (!pw) return 0

    let s = 0
    if (pw.length >= 8) s++
    if (pw.length >= 12) s++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++

    return Math.min(s, 5)
  })

  const level = computed(() => levels[Math.max(0, score.value - 1)] || levels[0])
  const hasPassword = computed(() => (passwordRef.value || '').length > 0)

  const criteria = computed(() => {
    const pw = passwordRef.value || ''
    return [
      { label: 'At least 8 characters', met: pw.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(pw) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(pw) },
      { label: 'Contains a number', met: /[0-9]/.test(pw) },
      { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(pw) },
    ]
  })

  return { score, level, hasPassword, criteria, levels }
}
