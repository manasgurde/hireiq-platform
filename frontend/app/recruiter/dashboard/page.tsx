"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CandidatesTable from "@/components/recruiter/CandidatesTable";
import {
  Briefcase,
  FileText,
  CheckCircle2,
  Brain,
  TrendingUp,
  Download,
  Plus,
  ChevronRight,
  Activity,
  Star,
  Clock,
} from "lucide-react";
import AnalyticsDashboard from "@/components/recruiter/AnalyticsDashboard";
import { useAuthStore } from "@/store/authStore";
import { jobsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  icon,
  label,
  value,
  badge,
  badgeColor = "bg-emerald-100 text-emerald-700",
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge?: string;
  badgeColor?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">{icon}</div>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${badgeColor}`}>
            <TrendingUp className="w-3 h-3" />
            {badge}
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-9 w-24 mb-1" />
      ) : (
        <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      )}
      <div className="text-sm font-medium text-slate-500">{label}</div>
    </div>
  );
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalHires, setTotalHires] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    async function fetchJobs() {
      if (!user?.id) return;
      try {
        const res = await jobsApi.list({ recruiter_id: user.id });
        const items = res.data.items || [];
        setJobs(items);
        
        let apps = 0;
        let hires = 0;
        let reject = 0;
        items.forEach((j: any) => {
          apps += j.application_count || 0;
          hires += j.hired_count || 0;
          reject += j.rejected_count || 0;
        });
        setTotalApplications(apps);
        setTotalHires(hires);
        setTotalRejected(reject);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    }
    fetchJobs();
  }, [user?.id]);

  const activeJobs = jobs.filter((j) => j.status === "active").length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-screen-xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600 mb-1">Recruiter Portal</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back! 👋</h1>
          <p className="text-slate-500 mt-1 text-sm">Here's what's happening with your pipeline today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/recruiter/jobs/new">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Post New Job
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
          label="Active Jobs"
          value={activeJobs || jobs.length || 0}
          badge="+2 this week"
          loading={loadingJobs}
        />
        <StatCard
          icon={<FileText className="w-5 h-5 text-purple-600" />}
          label="Total Applications"
          value={totalApplications || 0}
          badge="+15% vs last mo"
          loading={loadingJobs}
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          label="Shortlisted"
          value={totalHires || 0}
          badge={undefined}
          badgeColor="bg-amber-100 text-amber-700"
          loading={loadingJobs}
        />
        <StatCard
          icon={<Brain className="w-5 h-5 text-rose-600" />}
          label="Avg AI Match Score"
          value="N/A"
          loading={loadingJobs}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jobs selector */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Active Jobs</h2>
              <Link href="/recruiter/jobs/new">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  New Job
                </button>
              </Link>
            </div>
            <div className="p-4">
              {loadingJobs ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-9 w-24 rounded-xl" />
                  <Skeleton className="h-9 w-32 rounded-xl" />
                  <Skeleton className="h-9 w-28 rounded-xl" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500">No jobs posted yet</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Create your first job to start receiving applications</p>
                  <Link href="/recruiter/jobs/new">
                    <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                      Post a Job
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        selectedJobId === job.id
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50"
                      }`}
                    >
                      {job.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Candidates table */}
          {selectedJobId && <CandidatesTable jobId={selectedJobId} />}
          {!selectedJobId && jobs.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">Candidate applications will appear here</p>
              <p className="text-xs text-slate-400 mt-1">Select a job above to view applications</p>
            </div>
          )}

          {/* Analytics Chart */}
          <AnalyticsDashboard />
        </div>

        {/* Right 1/3 */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link href="/recruiter/jobs/new">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-700 border border-slate-100 hover:border-indigo-200 transition-all text-left">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-indigo-600" />
                  </div>
                  Post New Job
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                </button>
              </Link>
              <Link href="/recruiter/analytics">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-purple-700 border border-slate-100 hover:border-purple-200 transition-all text-left">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  View Analytics
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                </button>
              </Link>
            </div>
          </div>

          {/* Top Candidates widget */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Star className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-semibold text-slate-900">Top Candidates</h3>
            </div>
            <div className="p-5">
              {jobs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  Apply candidates will rank here based on AI match scores.
                </p>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">
                  Top ranked candidates across all your jobs will appear here.
                </p>
              )}
            </div>
            <div className="px-5 pb-4">
              <button className="w-full py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors">
                View Full Leaderboard
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-indigo-200" />
              <h3 className="font-semibold text-sm">Pipeline Status</h3>
            </div>
            <div className="text-4xl font-bold mb-1">{totalApplications} <span className="text-xl font-medium text-indigo-200">total apps</span></div>
            <p className="text-xs text-indigo-200 mt-2">Active candidates in your pipeline</p>
            <div className="mt-4 h-1.5 bg-white/20 rounded-full">
              <div className="h-full w-full bg-white/70 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart3({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
