/**
 * @typedef {{ en: string, ar: string }} Translation
 */

/**
 * @typedef {Object} StaffFacilityRole
 * @property {string} uuid
 * @property {Translation} name
 * @property {string} slug
 */

/**
 * @typedef {Object} StaffFacility
 * @property {string} uuid
 * @property {Translation} name
 * @property {StaffFacilityRole} [role]
 * @property {{ uuid: string, name: Translation }} [department]
 * @property {{ uuid: string, name: Translation }} [position]
 * @property {string|null} [joined_at]
 * @property {string|null} [ended_at]
 */

/**
 * @typedef {Object} StaffUser
 * @property {Translation} name
 * @property {string} email
 * @property {string|null} [avatar]
 * @property {string|null} [cover_image]
 */

/**
 * @typedef {Object} Staff
 * @property {string} uuid
 * @property {number|null} [experience_years]
 * @property {number|null} [consultation_fee]
 * @property {string|null} [status]
 * @property {StaffUser} [user]
 * @property {StaffFacility[]} [facilities]
 * @property {Translation} [specialization]
 * @property {Translation} [bio]
 * @property {Array<{uuid:string,name:Translation}>} [symptoms]
 */

/**
 * Maps API staff object → edit form values.
 * @param {Staff|null} data
 * @returns {Object}
 */
export function staffApiToForm(data) {
  if (!data) return emptyForm()

  const user = data.user || {}
  const name = user.name || {}
  console.log(user);

  return {
    name_en: name.en || '',
    name_ar: name.ar || '',
    email: user.email || '',
    specialization_en: data.specialization?.en || '',
    specialization_ar: data.specialization?.ar || '',
    bio_en: data.bio?.en || '',
    bio_ar: data.bio?.ar || '',
    experience_years: data.experience_years ?? '',
    consultation_fee: data.consultation_fee ?? '',
    avatar: user.avatar || null,
    cover_image: user.cover_image || null,
    facilities: (data.facilities || []).map(f => ({
      facility_uuid: f.uuid,
      role_uuid: f.role?.uuid || '',
      department_uuid: f.department?.uuid || '',
      position_uuid: f.position?.uuid || '',
      joined_at: f.joined_at || null,
      ended_at: f.ended_at || null,
    })),
    symptoms: (data.symptoms || []).map(s => s.uuid || s.id),
  }
}

/**
 * Returns empty form defaults.
 * @returns {Object}
 */
export function emptyForm() {
  return {
    name_en: '',
    name_ar: '',
    email: '',
    specialization_en: '',
    specialization_ar: '',
    bio_en: '',
    bio_ar: '',
    experience_years: '',
    consultation_fee: '',
    avatar: null,
    cover_image: null,
    facilities: [],
    symptoms: [],
  }
}

/**
 * Maps edit form values → API update payload.
 * @param {Object} form
 * @returns {Object}
 */
export function staffFormToUpdatePayload(form) {
  const payload = {
    specialization: {
      en: form.specialization_en,
      ar: form.specialization_ar,
    },
    bio: {
      en: form.bio_en,
      ar: form.bio_ar,
    },
    experience_years: form.experience_years !== '' ? Number(form.experience_years) : null,
    consultation_fee: form.consultation_fee !== '' ? Number(form.consultation_fee) : null,
    facilities: (form.facilities || []).map(f => ({
      facility_uuid: f.facility_uuid,
      role_uuid: f.role_uuid || null,
      department_uuid: f.department_uuid || null,
      position_uuid: f.position_uuid || null,
    })),
    symptom_ids: form.symptoms || [],
  }

  if (form.avatar instanceof File) {
    payload.avatar = form.avatar
  }
  if (form.cover_image instanceof File) {
    payload.cover_image = form.cover_image
  }

  return payload
}

/**
 * Determines online status based on last_seen_at timestamp.
 * @param {string|null} lastSeenAt
 * @param {number} [minutesThreshold=5]
 * @returns {'Online'|'Offline'}
 */
export function getOnlineStatus(lastSeenAt, minutesThreshold = 5) {
  if (!lastSeenAt) return 'Offline'
  const diff = Date.now() - new Date(lastSeenAt).getTime()
  return diff < minutesThreshold * 60 * 1000 ? 'Online' : 'Offline'
}

/**
 * Formats consultation fee with currency.
 * @param {number|null} fee
 * @param {string} [currency='$']
 * @returns {string}
 */
export function formatFee(fee, currency = '$') {
  if (fee == null || fee === '') return '—'
  return `${currency}${Number(fee).toLocaleString()}`
}

/**
 * Formats experience years label.
 * @param {number|null} years
 * @returns {string}
 */
export function formatExperience(years) {
  if (years == null || years === '') return '—'
  const n = Number(years)
  return `${n} ${n === 1 ? 'Year' : 'Years'}`
}
