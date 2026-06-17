'use client'

import type { Job } from '@/lib/api'
import { MapPin, DollarSign, Zap, Clock } from 'lucide-react'
import Link from 'next/link'

interface JobCardProps {
  job: Job
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salary_min, job.salary_max)

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block group"
    >
      <article className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
          </div>
          {!job.is_active && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30">
              Closed
            </span>
          )}
        </div>

        {/* Description excerpt */}
        <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Footer: salary + time + skills */}
        <div className="flex flex-wrap items-center gap-3">
          {salary && (
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{salary}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-500 text-xs ml-auto">
            <Clock className="w-3 h-3" />
            <span>{timeAgo(job.created_at)}</span>
          </div>
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-xs border border-blue-500/20"
              >
                <Zap className="w-2.5 h-2.5" />
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs">
                +{job.skills.length - 5}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  )
}
