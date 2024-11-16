import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://djangoportal-backends.onrender.com/api/'

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Initialize retry count if it doesn't exist
    if (originalRequest._retryCount === undefined) {
      originalRequest._retryCount = 0
    }

    // Check if we should retry the request
    const shouldRetry = 
      error.response?.status === 401 && 
      originalRequest._retryCount < 5 && 
      !originalRequest.url?.includes('/login')

    if (shouldRetry) {
      originalRequest._retryCount++
      console.log(`retrying... ${originalRequest._retryCount}`)
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${baseURL}refresh-token`, {
          refresh: refreshToken,
        })
        
        localStorage.setItem('access_token', response.data.access)
        apiClient.defaults.headers['Authorization'] = `Bearer ${response.data.access}`
        
        // Retry the original request with the new token
        return apiClient(originalRequest)
      } catch (refreshError) {
        // If we've exhausted all retries or refresh token is invalid
        if (originalRequest._retryCount >= 5) {
          clearAuthTokens()
          return Promise.reject(refreshError)
        }
        
        // If refresh failed but we still have retries left,
        // wait a bit before trying again (exponential backoff)
        const backoffDelay = Math.pow(2, originalRequest._retryCount) * 1000
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
        
        // Retry the refresh token process
        return apiClient(originalRequest)
      }
    }

    return Promise.reject(error)
  }
)

export const clearAuthTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export default apiClient