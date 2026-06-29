import httpClient from './httpClient'

export function createCrudService(basePath) {
  return {
    list(params = {}) {
      return httpClient.get(basePath, { params })
    },

    get(id) {
      return httpClient.get(`${basePath}/${id}`)
    },

    create(data) {
      return httpClient.post(basePath, data)
    },

    update(id, data) {
      return httpClient.put(`${basePath}/${id}`, data)
    },

    delete(id) {
      return httpClient.delete(`${basePath}/${id}`)
    },

    restore(id) {
      return httpClient.post(`${basePath}/${id}/restore`)
    },

    stats() {
      return httpClient.get(`${basePath}/stats`)
    },
  }
}

export function createFormDataService(basePath) {
  function toFormData(data) {
    const fd = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue
      if (Array.isArray(value)) {
        value.forEach((v) => fd.append(`${key}[]`, v))
      } else if (value instanceof File) {
        fd.append(key, value)
      } else {
        fd.append(key, String(value))
      }
    }
    return fd
  }

  return {
    list(params = {}) {
      return httpClient.get(basePath, { params })
    },

    get(id) {
      return httpClient.get(`${basePath}/${id}`)
    },

    create(data) {
      return httpClient.post(basePath, toFormData(data), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },

    update(id, data) {
      const fd = toFormData(data)
      fd.append('_method', 'PUT')
      return httpClient.post(`${basePath}/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },

    delete(id) {
      return httpClient.delete(`${basePath}/${id}`)
    },

    stats() {
      return httpClient.get(`${basePath}/stats`)
    },
  }
}
