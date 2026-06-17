import { jobsApi, type Job } from '@/lib/api'

// Add jobs API helper to lib/api.ts (separate export)
export const jobsApiHelpers = {
  listJobs: (params: {
    q?: string
    skills?: string[]
    location?: string
    min_salary?: number
    page?: number
    limit?: number
  }) => jobsApi.list(params),
}
