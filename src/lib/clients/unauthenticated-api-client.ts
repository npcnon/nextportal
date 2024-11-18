import axios, { 
    AxiosInstance, 
    AxiosError, 
    InternalAxiosRequestConfig,
    AxiosResponse 
  } from 'axios'
  
  // Custom error classes
  export class NetworkError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'NetworkError'
    }
  }
  
  export class AuthenticationError extends Error {
    constructor(message: string = 'User is not logged in') {
      super(message)
      this.name = 'AuthenticationError'
    }
  }
  
  // Base configuration
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
  const DEFAULT_TIMEOUT = 15000 // 15 seconds
  
  // Unauthenticated API Client
  const unauthenticatedApiClient: AxiosInstance = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  // Network error handling interceptors
  unauthenticatedApiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      // Handle network errors
      if (!error.response) {
        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new NetworkError('Request timed out. Please check your internet connection.'))
        }
        
        if (error.message.includes('Network Error')) {
          return Promise.reject(new NetworkError('Unable to connect to the server. Please check your internet connection.'))
        }
        
        return Promise.reject(new NetworkError('A network error occurred. Please try again later.'))
      }
      
      return Promise.reject(error)
    }
  )
  
  // Authenticated API Client
  const authenticatedApiClient: AxiosInstance = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  // Token refresh interface
  interface TokenRefreshResponse {
    access: string
    refresh?: string
  }
  
  // Utility functions
  export const clearAuthTokens = (): void => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
  
  const hasValidSession = (): boolean => {
    return Boolean(localStorage.getItem('refresh_token'))
  }
  
  // Authenticated client interceptors
  authenticatedApiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      return config
    },
    (error: AxiosError) => Promise.reject(error)
  )
  
  authenticatedApiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      
      // Handle network errors first
      if (!error.response) {
        const networkError = new NetworkError('A network error occurred. Please try again later.')
        return Promise.reject(networkError)
      }
  
      // Handle 401 (Unauthorized) errors
      if (error.response.status === 401) {
        // If already retried, clear tokens and reject
        if (originalRequest._retry) {
          clearAuthTokens()
          return Promise.reject(new AuthenticationError())
        }
  
        // Attempt to refresh token
        if (hasValidSession()) {
          originalRequest._retry = true
  
          try {
            const refreshToken = localStorage.getItem('refresh_token')
            const response = await unauthenticatedApiClient.post<TokenRefreshResponse>(
              '/refresh-token', 
              { refresh: refreshToken },
              { timeout: DEFAULT_TIMEOUT }
            )
            
            const newToken = response.data.access
            localStorage.setItem('access_token', newToken)
            
            // Update original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            return authenticatedApiClient(originalRequest)
          } catch (refreshError) {
            // Token refresh failed
            clearAuthTokens()
            return Promise.reject(new AuthenticationError('Session expired. Please login again.'))
          }
        } else {
          // No valid session
          clearAuthTokens()
          return Promise.reject(new AuthenticationError())
        }
      }
  
      return Promise.reject(error)
    }
  )
  
  export default unauthenticatedApiClient