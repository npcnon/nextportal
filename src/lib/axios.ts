import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig,
  AxiosResponse 
} from 'axios'

interface TokenRefreshResponse {
  access: string
  refresh?: string
}

interface RefreshSubscriber {
  (token: string): void
}

// Custom error class for network issues
export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

// Custom error class for authentication issues
export class AuthenticationError extends Error {
  constructor(message: string = 'User is not logged in') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://djangoportal-backends.onrender.com/api/'

const DEFAULT_TIMEOUT = 15000 // 15 seconds

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let refreshSubscribers: RefreshSubscriber[] = []

const subscribeTokenRefresh = (callback: RefreshSubscriber): void => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.map(callback => callback(token))
  refreshSubscribers = []
}

// Helper function to check if error is network related
const isNetworkError = (error: AxiosError): boolean => {
  return !error.response && Boolean(error.isAxiosError)
}

// Helper function to check if error is timeout related
const isTimeoutError = (error: AxiosError): boolean => {
  return error.code === 'ECONNABORTED'
}

// Helper function to get appropriate error message
const getNetworkErrorMessage = (error: AxiosError): string => {
  if (isTimeoutError(error)) {
    return 'Request timed out. Please check your internet connection and try again.'
  }
  
  if (error.message.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your internet connection.'
  }
  
  return 'A network error occurred. Please try again later.'
}

// Helper function to check if user has a valid session
const hasValidSession = (): boolean => {
  return Boolean(localStorage.getItem('refresh_token'))
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check for refresh token first on protected routes
    if (!config.url?.includes('/login') && !hasValidSession()) {
      throw new AuthenticationError()
    }

    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Handle network errors first
    if (isNetworkError(error)) {
      const networkError = new NetworkError(getNetworkErrorMessage(error))
      return Promise.reject(networkError)
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Check for refresh token before attempting to refresh
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/login')
    ) {
      if (!hasValidSession()) {
        clearAuthTokens()
        return Promise.reject(new AuthenticationError())
      }

      if (isRefreshing) {
        return new Promise(resolve => {
          subscribeTokenRefresh(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post<TokenRefreshResponse>(
          `${baseURL}refresh-token`, 
          { refresh: refreshToken },
          { timeout: DEFAULT_TIMEOUT }
        )
        
        const newToken = response.data.access
        localStorage.setItem('access_token', newToken)
        apiClient.defaults.headers['Authorization'] = `Bearer ${newToken}`
        
        onTokenRefreshed(newToken)
        isRefreshing = false
        
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        clearAuthTokens()
        isRefreshing = false
        refreshSubscribers = []
        
        if (refreshError instanceof AxiosError && isNetworkError(refreshError)) {
          return Promise.reject(
            new NetworkError(getNetworkErrorMessage(refreshError))
          )
        }
        
        return Promise.reject(new AuthenticationError('Session expired. Please login again.'))
      }
    }

    return Promise.reject(error)
  }
)

export const clearAuthTokens = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export default apiClient