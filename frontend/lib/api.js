import axios from 'axios'

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// API helper functions
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    getProfile: () => apiClient.get('/auth/me'),
  },

  // Emissions endpoints
  emissions: {
    getAll: (params) => apiClient.get('/emissions', { params }),
    getById: (id) => apiClient.get(`/emissions/${id}`),
    create: (data) => apiClient.post('/emissions', data),
    update: (id, data) => apiClient.put(`/emissions/${id}`, data),
    delete: (id) => apiClient.delete(`/emissions/${id}`),
  },

  // Reports endpoints
  reports: {
    generatePDF: (params) => apiClient.get('/reports/pdf', { params }),
    generateCSV: (params) => apiClient.get('/reports/csv', { params }),
  },

  // AI endpoints
  ai: {
    getSuggestions: (data) => apiClient.post('/ai/suggestions', data),
    chat: (message) => apiClient.post('/ai/chat', { message }),
  },
}

export default api 