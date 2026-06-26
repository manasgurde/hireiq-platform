'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Activity, Loader2, DollarSign, Briefcase } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Platform Analytics</h1>
            <p className="text-slate-400">System-wide metrics and revenue performance.</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
            Download Report
          </button>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard title="Total Users" value="124K" trend="+12%" trendUp={true} icon={<Users className="w-5 h-5 text-blue-400" />} />
          <KPICard title="Active Jobs" value="8,402" trend="+5%" trendUp={true} icon={<Briefcase className="w-5 h-5 text-purple-400" />} />
          <KPICard title="MRR" value="$42,500" trend="+18%" trendUp={true} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} />
          <KPICard title="Server Load" value="42%" trend="-5%" trendUp={true} icon={<Activity className="w-5 h-5 text-yellow-400" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Growth */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Revenue Growth
            </h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {/* Simulated Bar Chart */}
              {[30, 45, 40, 60, 55, 75, 85, 90, 100, 95, 110, 120].map((val, i) => (
                <div key={i} className="w-full bg-slate-800 rounded-t-sm group relative">
                  <div 
                    className="absolute bottom-0 w-full bg-emerald-500 rounded-t-sm transition-all duration-1000 group-hover:bg-emerald-400" 
                    style={{ height: `${val}%` }} 
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-medium text-slate-500">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </div>

          {/* User Signups */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              User Acquisition
            </h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {/* Simulated Bar Chart */}
              {[40, 35, 50, 45, 60, 70, 80, 75, 85, 90, 100, 110].map((val, i) => (
                <div key={i} className="w-full bg-slate-800 rounded-t-sm group relative">
                  <div 
                    className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-1000 group-hover:bg-blue-400" 
                    style={{ height: `${val}%` }} 
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-medium text-slate-500">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, trend, trendUp, icon }: { title: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-md ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400 font-medium">{title}</div>
    </div>
  )
}
