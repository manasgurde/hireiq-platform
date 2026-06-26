'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Building2, Globe, Users, Loader2, MapPin } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  description: string | null
  website: string | null
  logo_url: string | null
  industry: string | null
  size: string | null
}

export default function CompanyProfilePage() {
  const params = useParams()
  const companyId = params.id as string
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1'}/companies/${companyId}`)
        setCompany(res.data)
      } catch (e) {
        setError(true)
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [companyId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center flex-col text-slate-400">
        <Building2 className="w-16 h-16 text-slate-700 mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Company Not Found</h1>
        <p>This company profile doesn't exist or is unavailable.</p>
        <Link href="/search" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
          Go back to Search
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 pt-24 pb-16">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden mb-12">
          {/* Banner bg */}
          <div className="h-48 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900 w-full" />
          
          <div className="absolute top-24 left-8 flex items-end gap-6">
            <div className="w-32 h-32 rounded-2xl bg-slate-800 border-4 border-[#050505] shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
              {company.logo_url ? (
                <img src={company.logo_url} alt={`${company.name} logo`} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-12 h-12 text-slate-500" />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-8 flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 font-medium">
              {company.industry && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                  <Globe className="w-4 h-4" /> {company.industry}
                </span>
              )}
              {company.size && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                  <Users className="w-4 h-4" /> {company.size} employees
                </span>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors px-3 py-1">
                  <Globe className="w-4 h-4" /> Visit Website
                </a>
              )}
            </div>
          </div>
          <button className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl shadow-lg shadow-white/10 hover:bg-slate-200 transition-all">
            Follow Company
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">About {company.name}</h2>
            <div className="text-slate-400 leading-relaxed space-y-4 whitespace-pre-wrap">
              {company.description || 'No description provided.'}
            </div>

            <h2 className="text-xl font-bold text-white mt-12 mb-6">Open Roles</h2>
            {/* Stub for jobs */}
            <div className="border border-slate-800 bg-slate-900/50 rounded-2xl p-8 flex flex-col items-center text-center text-slate-500">
              <BriefcaseIcon className="w-8 h-8 mb-3 opacity-50" />
              <p>No open roles currently posted.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30">
              <h3 className="font-semibold text-white mb-4">Company Overview</h3>
              <ul className="space-y-4 text-sm">
                {company.industry && (
                  <li className="flex justify-between items-center">
                    <span className="text-slate-500">Industry</span>
                    <span className="text-slate-200 font-medium">{company.industry}</span>
                  </li>
                )}
                {company.size && (
                  <li className="flex justify-between items-center">
                    <span className="text-slate-500">Company Size</span>
                    <span className="text-slate-200 font-medium">{company.size}</span>
                  </li>
                )}
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Headquarters</span>
                  <span className="text-slate-200 font-medium">San Francisco, CA</span> {/* Example hardcoded for now */}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BriefcaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}
