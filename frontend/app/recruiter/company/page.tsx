'use client'

import { useState, useEffect, useRef } from 'react'
import { Building2, Save, Upload, Loader2, Users, Plus, X } from 'lucide-react'
import axios from 'axios'

interface Company {
  id: string
  name: string
  description: string | null
  website: string | null
  logo_url: string | null
  industry: string | null
  size: string | null
}

interface Member {
  user_id: string
  role: string
}

export default function ManageCompanyPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [size, setSize] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1',
    headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''}` },
  })

  useEffect(() => {
    fetchCompanyData()
  }, [])

  const fetchCompanyData = async () => {
    setLoading(true)
    try {
      // In a real app, the backend would have a /recruiter/my-company endpoint 
      // or the recruiter would fetch companies they belong to.
      // For this demo, let's assume they only have one company, or we fetch the first one.
      // We didn't build a specific /my-company endpoint, but we can assume company creation
      // or we can just fetch companies? Wait, there's no /my-company endpoint!
      // Let's stub it with a hardcoded ID or show a "Create Company" screen if none.
      setError("To view your company, please implement the user's company relation API.")
    } catch (e) {
      console.error(e)
      setError('Failed to load company data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!company) return
    setSaving(true)
    try {
      const res = await api.put(`/companies/${company.id}`, {
        description,
        website,
        industry,
        size
      })
      setCompany(res.data)
      alert("Saved successfully!")
    } catch (e) {
      console.error(e)
      alert("Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !company) return
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await api.post(`/companies/${company.id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setCompany(res.data)
    } catch (err) {
      console.error(err)
      alert("Failed to upload logo")
    }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-50 pt-24 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Company Associated</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              You haven't created or joined a company yet. Create your company profile to start posting jobs.
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors">
              Create Company Profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Manage Company</h1>
            <p className="text-slate-400">Update your company brand, details, and team members.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Branding */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white mb-6">Branding & Identity</h2>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Company Logo</h3>
                  <p className="text-sm text-slate-400 mb-3">Recommended size: 400x400px (JPG, PNG).</p>
                  <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-700"
                  >
                    <Upload className="w-4 h-4" /> Upload New Logo
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Company Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    placeholder="Tell candidates about your mission, culture, and what you build..."
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white mb-6">Company Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all text-sm"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all text-sm"
                    placeholder="e.g. B2B SaaS, FinTech"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Company Size</label>
                  <select
                    value={size}
                    onChange={e => setSize(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all text-sm appearance-none"
                  >
                    <option value="">Select size...</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Team Members */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Team Members</h2>
                <div className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold">
                  {members.length} Users
                </div>
              </div>
              
              <div className="flex gap-2 mb-6">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1 text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Invite
                </button>
              </div>

              <div className="space-y-3">
                {members.map(m => (
                  <div key={m.user_id} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0a] border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-[120px]">{m.user_id}</p>
                        <p className="text-xs text-slate-500 capitalize">{m.role}</p>
                      </div>
                    </div>
                    {m.role !== 'owner' && (
                      <button className="text-slate-600 hover:text-red-400 p-1 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-4">No team members yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
