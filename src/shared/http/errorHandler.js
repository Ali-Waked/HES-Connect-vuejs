export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors || null
  }
}

export function errorHandler(error) {
  if (error.response) {
    const { data, status } = error.response
    const message = data?.message || getDefaultMessage(status)
    return new ApiError(message, status, data?.errors)
  }

  if (error.request) {
    return new ApiError('Network error. Please check your connection.', 0)
  }

  return new ApiError('An unexpected error occurred.', -1)
}

function getDefaultMessage(status) {
  const messages = {
    400: 'Invalid request.',
    401: 'Unauthorized. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'Resource not found.',
    409: 'Conflict with existing data.',
    422: 'Validation failed. Please check your input.',
    429: 'Too many requests. Please slow down.',
    500: 'Server error. Please try again later.',
    503: 'Service unavailable. Please try again later.',
  }
  return messages[status] || 'An error occurred.'
}

export function getValidationErrors(apiError) {
  if (!apiError?.errors) return {}
  const flat = {}
  for (const [field, messages] of Object.entries(apiError.errors)) {
    flat[field] = Array.isArray(messages) ? messages[0] : messages
  }
  return flat
}
