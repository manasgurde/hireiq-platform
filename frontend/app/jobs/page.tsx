'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, MapPin, Briefcase, Filter, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { jobsApi, type Job } from '@/lib/api'
import JobCard from '@/components/jobs/JobCard'
import { useForm } from 'react-hook-form'

interface FilterForm {
  q: string
  location: string
  min_salary: string
  skills: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { register, handleSubmit, reset, watch } = useForm<FilterForm>({
    defaultValues: {
      q: '',
      location: '',
      min_salary: '',
      skills: '',
    },
  })

  // Watch for debounced live search on 'q'
  const searchQuery = watch('q')

  const fetchJobs = useCallback(async (filters: Partial<FilterForm>, targetPage: number) => {
    setIsLoading(true)
    try {
      // Parse skills from comma-separated string
      const skillsArray = filters.skills
        ? filters.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined

      const params = {
        q: filters.q || undefined,
        location: filters.location || undefined,
        min_salary: filters.min_salary ? parseInt(filters.min_salary, 10) : undefined,
        skills: skillsArray?.length ? skillsArray : undefined,
        page: targetPage,
        limit: 10,
      }

      const res = await jobsApi.list(params)
      setJobs(res.data.items)
      setTotal(res.data.total)
      setTotalPages(res.data.pages)
      setPage(targetPage)
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchJobs({}, 1)
  }, [fetchJobs])

  // Simple debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSubmit((data) => fetchJobs(data, 1))()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchJobs, handleSubmit])

  const onSubmitFilters = (data: FilterForm) => {
    fetchJobs(data, 1)
    setIsFilterOpen(false)
  }

  const handleClear = () => {
    reset()
    fetchJobs({}, 1)
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none opacity-30">
          <div className="absolute -top-24 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px]" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">great opportunity</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Discover thousands of open roles tailored to your skills and career goals.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-end">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside
          className={`${
            isFilterOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 lg:w-72 shrink-0`}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-400" />
                Filters
              </h2>
              {isFilterOpen && (
                <button onClick={() => setIsFilterOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmitFilters)} className="space-y-5">
              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Keywords</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Job title, company..."
                    {...register('q')}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="City, state, or remote"
                    {...register('location')}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Minimum Salary */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Min Salary ($)</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    placeholder="e.g. 80000"
                    {...register('min_salary')}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, Python, AWS"
                  {...register('skills')}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* Main Job List Area */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {isLoading ? 'Searching...' : `${total} Jobs Found`}
            </h2>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p>Loading opportunities...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No jobs match your criteria</h3>
              <p className="text-slate-400 max-w-sm mx-auto mb-6">
                Try adjusting your filters, removing keywords, or broadening your location to see more results.
              </p>
              <button
                onClick={handleClear}
                className="text-blue-400 font-medium hover:text-blue-300"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleSubmit((data) => fetchJobs(data, page - 1))()}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-slate-400 text-sm font-medium px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handleSubmit((data) => fetchJobs(data, page + 1))()}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
