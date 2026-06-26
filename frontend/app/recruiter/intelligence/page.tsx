'use client'

import { useState, useEffect } from 'react'
import { Bookmark, Users, Activity, ChevronRight, Loader2, Star, Plus } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'
import { Skeleton } from "@/components/ui/skeleton"

interface BookmarkItem {
  id: string
  candidate_id: string
  notes: string | null
}

interface TalentPool {
  id: string
  name: string
  description: string | null
}

type Tab = 'bookmarks' | 'pools' | 'compare'

export default function RecruiterIntelligencePage() {
  const [activeTab, setActiveTab] = useState<Tab>('bookmarks')
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [pools, setPools] = useState<TalentPool[]>([])
  const [loading, setLoading] = useState(true)

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1',
    headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}` },
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [bmRes, poolRes] = await Promise.all([
        api.get('/recruiter/bookmarks'),
        api.get('/recruiter/talent-pools')
      ])
      setBookmarks(bmRes.data)
      setPools(poolRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const removeBookmark = async (candidateId: string) => {
    try {
      await api.delete(`/recruiter/bookmarks/${candidateId}`)
      setBookmarks(bookmarks.filter(b => b.candidate_id !== candidateId))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Recruiter Intelligence</h1>
          <p className="text-slate-400">Manage your candidate pipeline, talent pools, and saved bookmarks.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-8">
          {(['bookmarks', 'pools', 'compare'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab === 'bookmarks' && <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Bookmarks</span>}
              {tab === 'pools' && <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Talent Pools</span>}
              {tab === 'compare' && <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Compare</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative">
                <div className="flex justify-between items-start mb-3">
                  <Skeleton className="w-10 h-10 rounded-full bg-slate-800" />
                </div>
                <Skeleton className="h-4 w-24 mb-1 bg-slate-800" />
                <Skeleton className="h-3 w-48 mb-4 bg-slate-800" />
                <Skeleton className="h-16 w-full rounded-lg mb-4 bg-slate-800" />
                <Skeleton className="h-4 w-24 bg-slate-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'bookmarks' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.length === 0 ? (
                  <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-2xl">
                    <Star className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No bookmarked candidates yet.</p>
                  </div>
                ) : (
                  bookmarks.map(bm => (
                    <div key={bm.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {bm.candidate_id.substring(0, 2).toUpperCase()}
                        </div>
                        <button
                          onClick={() => removeBookmark(bm.candidate_id)}
                          className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="font-medium text-slate-200 text-sm mb-1">Candidate ID</p>
                      <p className="text-xs text-slate-500 truncate mb-4">{bm.candidate_id}</p>
                      {bm.notes && (
                        <div className="bg-slate-800/50 p-3 rounded-lg text-sm text-slate-300">
                          {bm.notes}
                        </div>
                      )}
                      <Link href={`/candidate/${bm.candidate_id}`} className="mt-4 flex items-center justify-between text-blue-400 text-sm hover:text-blue-300 transition-colors">
                        View Profile <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'pools' && (
              <div>
                <div className="flex justify-end mb-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors">
                    <Plus className="w-4 h-4" /> Create Pool
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pools.length === 0 ? (
                    <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-2xl">
                      <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No talent pools created.</p>
                    </div>
                  ) : (
                    pools.map(pool => (
                      <div key={pool.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors cursor-pointer">
                        <div>
                          <h3 className="font-semibold text-lg text-white mb-1">{pool.name}</h3>
                          <p className="text-sm text-slate-400">{pool.description || 'No description provided.'}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl">
                <Activity className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">Candidate Radar</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                  Select up to 5 candidates from your bookmarks or talent pools to visualize their skill overlap matrix.
                </p>
                <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors">
                  Select Candidates
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
