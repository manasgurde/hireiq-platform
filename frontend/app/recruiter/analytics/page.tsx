"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain, BarChart2, TrendingUp, Users, Briefcase, Calendar,
  Award, Target, Zap, Download, Clock, MessageSquare, LogOut,
  Plus, Settings, ChevronRight, Activity
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { analyticsApi, jobsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecruiterAnalyticsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [topJobs, setTopJobs] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user?.id) return;
      try {
        const [funnelRes, jobsRes] = await Promise.allSettled([
          analyticsApi.getFunnel(),
          jobsApi.list({ recruiter_id: user.id })
        ]);
        
        let apps = 0;
        const jobItems = jobsRes.status === "fulfilled" ? jobsRes.value.data.items || [] : [];
        jobItems.forEach((j: any) => {
          apps += j.application_count || 0;
        });
        setTotalApplications(apps);

        if (funnelRes.status === "fulfilled") {
          const funnelDataObj = funnelRes.value.data.data?.funnel || {};
          const totalApps = funnelRes.value.data.data?.total || 0;
          
          const getPct = (count: number) => totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
          
          const mappedFunnel = [
            { stage: "Applications", count: totalApps, pct: totalApps > 0 ? 100 : 0, color: "blue" },
            { stage: "Screened", count: funnelDataObj.reviewing || 0, pct: getPct(funnelDataObj.reviewing || 0), color: "indigo" },
            { stage: "Shortlisted", count: funnelDataObj.shortlisted || 0, pct: getPct(funnelDataObj.shortlisted || 0), color: "purple" },
            { stage: "Interviewed", count: funnelDataObj.interview || 0, pct: getPct(funnelDataObj.interview || 0), color: "teal" },
            { stage: "Offered/Hired", count: funnelDataObj.hired || 0, pct: getPct(funnelDataObj.hired || 0), color: "emerald" },
          ];
          setFunnelData(mappedFunnel);
        }

        const sortedJobs = [...jobItems].sort((a, b) => (b.application_count || 0) - (a.application_count || 0)).slice(0, 5);
        setTopJobs(sortedJobs.map(j => ({
          title: j.title,
          apps: j.application_count || 0,
          score: 80, // Needs backend AI score aggregation
          open: j.is_active ? 1 : 0
        })));
        
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-[#F1F5F9] min-h-screen p-6 md:p-8">
        <Skeleton className="h-24 w-full mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F5F9] min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-8 h-16 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recruitment Analytics</h2>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Download className="w-4 h-4" />Export Report
        </button>
      </header>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Applications", value: totalApplications.toString(), trend: "+0% this month", icon: <Users className="w-5 h-5" />, color: "blue" },
              { label: "Avg AI Score", value: "N/A", trend: "Needs more data", icon: <Brain className="w-5 h-5" />, color: "teal" },
              { label: "Time to Hire", value: "N/A", trend: "Needs more data", icon: <Clock className="w-5 h-5" />, color: "purple" },
              { label: "Offer Acceptance", value: "N/A", trend: "Needs more data", icon: <Award className="w-5 h-5" />, color: "emerald" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className={`w-9 h-9 rounded-xl bg-${kpi.color}-100 text-${kpi.color}-700 flex items-center justify-center mb-3`}>{kpi.icon}</div>
                <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />{kpi.trend}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hiring Funnel */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-5">Hiring Funnel</h3>
              <div className="space-y-3">
                {funnelData.map((stage) => (
                  <div key={stage.stage}>
                    <div className="flex justify-between items-center mb-1.5 text-sm">
                      <span className="text-slate-700 font-medium">{stage.stage}</span>
                      <span className="font-bold text-slate-900">{stage.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-3 rounded-full bg-${stage.color}-500 transition-all`} style={{ width: `${stage.pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{stage.pct}% of applicants</p>
                  </div>
                ))}
                {funnelData.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No data available for funnel.</p>
                )}
              </div>
            </div>

            {/* Top Jobs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Top Job Postings</h3>
              <div className="space-y-4">
                {topJobs.length > 0 ? topJobs.map((job) => (
                  <div key={job.title} className="border border-slate-100 rounded-xl p-3 hover:border-blue-200 transition-colors">
                    <p className="font-medium text-slate-900 text-sm truncate mb-1">{job.title}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{job.apps} applicants</span>
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3 text-teal-600" />{job.score}% avg
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mr-2">
                        <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${(job.score)}%` }} />
                      </div>
                      <span className="text-xs text-blue-700 font-medium whitespace-nowrap">{job.open} open</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 text-center py-4">No jobs data available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivities.length > 0 ? recentActivities.map((a) => (
                <div key={a.event} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    a.type === "shortlist" ? "bg-teal-100 text-teal-700" :
                    a.type === "job" ? "bg-blue-100 text-blue-700" :
                    a.type === "interview" ? "bg-purple-100 text-purple-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {a.type === "shortlist" ? <Users className="w-4 h-4" /> :
                     a.type === "job" ? <Briefcase className="w-4 h-4" /> :
                     a.type === "interview" ? <Calendar className="w-4 h-4" /> :
                     <Award className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{a.event}</p>
                  </div>
                  <span className="text-xs text-slate-400">{a.time}</span>
                </div>
              )) : (
                  <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
              )}
            </div>
          </div>
        </main>
    </div>
  );
}
