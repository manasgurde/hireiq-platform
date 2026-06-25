import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Sends httpOnly cookies automatically
  headers: { 'Content-Type': 'application/json' },
})

// ---------------------------------------------------------------------------
// Request interceptor: attach token
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---------------------------------------------------------------------------
// Response interceptor: auto-refresh on 401
// ---------------------------------------------------------------------------
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token as string)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await api.post('/v1/auth/refresh')
        const newToken = data.access_token

        // Update Zustand store
        const { setToken } = useAuthStore.getState()
        setToken(newToken)

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Clear auth state and redirect
        const { logout } = useAuthStore.getState()
        logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ---------------------------------------------------------------------------
// Typed API helpers
// ---------------------------------------------------------------------------
export interface RegisterRequest {
  email: string
  password: string
  role: 'candidate' | 'recruiter'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UserOut {
  id: string
  email: string
  role: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: UserOut
}

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/v1/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/v1/auth/login', data),

  googleLogin: (token: string, role?: string) => 
    api.post<AuthResponse>('/v1/auth/google', { token, role }),

  logout: () => api.post('/v1/auth/logout'),

  refreshToken: () => api.post<{ access_token: string }>('/v1/auth/refresh'),
}

export interface Resume {
  id: string
  candidate_id: string
  s3_url: string
  ai_evaluation?: {
    rating: number;
    good_points: string[];
    bad_points: string[];
    suggestions: string[];
    extracted_skills?: string[];
    candidate_name?: string;
  } | null
  created_at: string
}

export const resumesApi = {
  getUploadUrl: () => api.post('/v1/resumes/upload-url'),
  confirmUpload: (s3_key: string) => api.post('/v1/resumes/confirm', { s3_key }),
  getMine: () => api.get<Resume>('/v1/resumes/me'),
  evaluate: () => api.post<Resume>('/v1/resumes/me/evaluate'),
  delete: () => api.delete('/v1/resumes/me'),
}

export interface Profile {
  bio?: string | null
  avatar_url?: string | null
  skills: string[]
  phone_number?: string | null
  location?: string | null
  date_of_birth?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  full_name?: string | null
  completion_percentage?: number
}

export const usersApi = {
  getProfile: () => api.get<Profile>('/v1/users/profile'),
  updateProfile: (data: Partial<Profile>) => api.put<Profile>('/v1/users/profile', data),
  uploadAvatar: (formData: FormData) => api.post<Profile>('/v1/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ---------------------------------------------------------------------------
// Job types & API
// ---------------------------------------------------------------------------
export interface Job {
  id: string
  title: string
  description: string
  location: string
  skills: string[]
  salary_min: number | null
  salary_max: number | null
  is_active: boolean
  recruiter_id: string
  application_count?: number
  created_at: string
  updated_at: string
}

export interface JobListResponse {
  items: Job[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface JobListParams {
  q?: string
  skills?: string[]
  location?: string
  min_salary?: number
  page?: number
  limit?: number
  recruiter_id?: string
}

export const jobsApi = {
  list: (params: JobListParams = {}) =>
    api.get<JobListResponse>('/v1/jobs', { params }),

  get: (id: string) =>
    api.get<Job>(`/v1/jobs/${id}`),

  create: (data: Omit<Job, 'id' | 'recruiter_id' | 'is_active' | 'created_at' | 'updated_at'>) =>
    api.post<Job>('/v1/jobs', data),

  update: (id: string, data: Partial<Job>) =>
    api.put<Job>(`/v1/jobs/${id}`, data),

  delete: (id: string) =>
    api.delete(`/v1/jobs/${id}`),

  close: (id: string) =>
    api.patch<Job>(`/v1/jobs/${id}/close`),
}

export const applicationsApi = {
  listMine: () =>
    api.get<any[]>('/v1/applications/me'),

  listByJob: (jobId: string) =>
    api.get(`/v1/applications/job/${jobId}`),

  listAllForRecruiter: () =>
    api.get('/v1/applications/recruiter/all'),

  apply: (jobId: string) =>
    api.post('/v1/applications/', { job_id: jobId }),

  updateStatus: (appId: string, status: string) =>
    api.patch(`/v1/applications/${appId}/status`, { status }),

  evaluateAnswer: (applicationId: string, answer: string, idealAnswer: string) =>
    api.post(`/v1/applications/evaluate-answer`, {
      application_id: applicationId,
      candidate_answer: answer,
      ideal_answer: idealAnswer,
    }),
}

export const analyticsApi = {
  getFunnel: (jobId?: string) =>
    api.get(`/v1/analytics/funnel`, { params: jobId ? { job_id: jobId } : {} }),
  getTimeToHire: () =>
    api.get(`/v1/analytics/time-to-hire`),
  getRecruiterPerformance: () =>
    api.get(`/v1/analytics/recruiter-performance`),
  getPlatform: () =>
    api.get(`/v1/analytics/platform`),
}

export default api
