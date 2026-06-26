'use client'

import { useState } from 'react'
import { Search, Loader2, Star, MapPin, Briefcase, User } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

interface JobResult {
  id: string
  title: string
  location: string
  skills: string[]
  salary_min: number | null
  salary_max: number | null
  similarity: number
}

interface CandidateResult {
  user_id: string
  email: string
  bio: string | null
  skills: string[]
  avatar_url: string | null
  similarity: number
}

type SearchMode = 'jobs' | 'candidates'

export default function SemanticSearchPage() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('jobs')
  const [jobResults, setJobResults] = useState<JobResult[]>([])
  const [candidateResults, setCandidateResults] = useState<CandidateResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1',
    headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}` },
  })

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const endpoint = mode === 'jobs' ? '/search/jobs' : '/search/candidates'
      const res = await api.post(endpoint, { query, limit: 10 })
      if (mode === 'jobs') {
        setJobResults(res.data)
        setCandidateResults([])
      } else {
        setCandidateResults(res.data)
        setJobResults([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const SimilarityBadge = ({ score }: { score: number }) => {
    const pct = Math.round(score * 100)
    const color = pct >= 80 ? 'text-emerald-400 bg-emerald-400/10' : pct >= 60 ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 bg-slate-800'
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
        {pct}% match
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 mb-6">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-slate-300">AI Semantic Search</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-4">
            Search with natural language
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Describe what you're looking for in plain English. Our AI understands context, not just keywords.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex rounded-xl bg-slate-800/50 border border-slate-700/50 p-1">
            {(['jobs', 'candidates'] as SearchMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === m
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'jobs' ? '🔍 Job Search' : '👤 Candidate Search'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={
                  mode === 'jobs'
                    ? 'e.g. "remote Python backend role with Kubernetes experience"'
                    : 'e.g. "senior frontend developer with React and design skills"'
                }
                className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
            <p>Finding semantic matches...</p>
          </div>
        ) : searched && jobResults.length === 0 && candidateResults.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No matches found</h3>
            <p className="text-slate-400">Try a different description or broaden your query.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobResults.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {job.title}
                      </h3>
                      <SimilarityBadge score={job.similarity} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      {job.salary_min && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          ${(job.salary_min / 1000).toFixed(0)}k–${((job.salary_max || 0) / 1000).toFixed(0)}k
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                  >
                    View
                  </Link>
                </div>
                {job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 6).map((skill) => (
                      <span key={skill} className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {candidateResults.map((c) => (
              <div
                key={c.user_id}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold text-white">{c.email}</h3>
                      <SimilarityBadge score={c.similarity} />
                    </div>
                    {c.bio && <p className="text-sm text-slate-400 line-clamp-2 mb-3">{c.bio}</p>}
                    {c.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {c.skills.slice(0, 6).map((skill) => (
                          <span key={skill} className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
