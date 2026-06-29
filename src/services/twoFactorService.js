import axiosClient from '@/axiosClient'

export function getSecretKey() {
  return axiosClient.get('/user/two-factor-secret-key')
}

export function getQrCode() {
  return axiosClient.get('/user/two-factor-qr-code')
}

export function getRecoveryCodes() {
  return axiosClient.get('/user/two-factor-recovery-codes')
}

export function enableTwoFactor() {
  return axiosClient.post('/user/two-factor-authentication')
}

export function confirmTwoFactor(code) {
  return axiosClient.post('/user/confirmed-two-factor-authentication', { code })
}

export function disableTwoFactor() {
  return axiosClient.delete('/user/two-factor-authentication')
}

export function regenerateRecoveryCodes() {
  return axiosClient.post('/user/two-factor-recovery-codes')
}

export function twoFactorChallenge(code) {
  return axiosClient.post('/two-factor-challenge', { code })
}
