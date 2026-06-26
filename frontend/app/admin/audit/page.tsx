'use client'

import { useState, useEffect } from 'react'
import { Shield, ChevronDown, ChevronRight, Search, Loader2, User, Clock } from 'lucide-react'
import axios from 'axios'

interface AuditEntry {
  id: string
  actor_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  'user.login': 'text-blue-400',
  'user.register': 'text-emerald-400',
  'job.create': 'text-indigo-400',
  'job.update': 'text-yellow-400',
  'job.delete': 'text-red-400',
  'application.submit': 'text-purple-400',
  'application.status_change': 'text-orange-400',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [page, setPage] = useState(1)

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1',
    headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}` },
  })

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 50 }
      if (actionFilter) params.action = actionFilter
      if (entityFilter) params.entity_type = entityFilter
      const res = await api.get('/audit/logs', { params })
      setLogs(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [page, actionFilter, entityFilter])

  const formatDate = (iso: string) => new Date(iso).toLocaleString()

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
            <p className="text-slate-400 text-sm">Immutable record of all platform actions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by action (e.g. job.create)"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by entity type (e.g. job)"
              value={entityFilter}
              onChange={(e) => { setEntityFilter(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center">
              <Shield className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No audit logs found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {/* Table header */}
              <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-800/50">
                <span></span>
                <span>Action</span>
                <span>Entity</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Actor</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Time</span>
              </div>

              {logs.map((log) => (
                <div key={log.id}>
                  <div
                    className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-4 px-4 py-3.5 hover:bg-slate-800/30 cursor-pointer transition-colors items-center"
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  >
                    <span className="text-slate-600">
                      {expanded === log.id
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />}
                    </span>
                    <span className={`font-mono text-sm font-medium ${ACTION_COLORS[log.action] || 'text-slate-300'}`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-slate-400">
                      {log.entity_type ? (
                        <span>
                          <span className="text-slate-300">{log.entity_type}</span>
                          {log.entity_id && <span className="text-slate-600"> · {log.entity_id.slice(0, 8)}…</span>}
                        </span>
                      ) : '—'}
                    </span>
                    <span className="text-sm text-slate-500 font-mono">
                      {log.actor_id ? log.actor_id.slice(0, 12) + '…' : 'system'}
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(log.created_at)}</span>
                  </div>

                  {/* Expanded diff view */}
                  {expanded === log.id && (log.before || log.after) && (
                    <div className="px-4 pb-4 grid md:grid-cols-2 gap-4 bg-slate-800/20">
                      {log.before && (
                        <div>
                          <p className="text-xs font-medium text-red-400 mb-2 uppercase tracking-wider">Before</p>
                          <pre className="text-xs text-slate-400 bg-slate-900 border border-slate-700 rounded-xl p-3 overflow-auto max-h-48">
                            {JSON.stringify(log.before, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.after && (
                        <div>
                          <p className="text-xs font-medium text-emerald-400 mb-2 uppercase tracking-wider">After</p>
                          <pre className="text-xs text-slate-400 bg-slate-900 border border-slate-700 rounded-xl p-3 overflow-auto max-h-48">
                            {JSON.stringify(log.after, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-400">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={logs.length < 50 || loading}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
