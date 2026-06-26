"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, MapPin, Clock, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Job, jobsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchJobs() {
      if (!user?.id) return;
      try {
        const res = await jobsApi.list({ recruiter_id: user.id });
        setJobs(res.data.items || []);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [user?.id]);

  const statusColor: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    closed: "bg-red-100 text-red-700 border-red-200",
  };

  const handleCloseJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to close this job? It will no longer be visible to candidates.")) return;
    try {
      await jobsApi.close(jobId);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_active: false } : j));
    } catch (e) {
      console.error("Failed to close job", e);
      alert("Failed to close job.");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Job Postings</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage and track all your open positions.</p>
        </div>
        <Link href="/recruiter/jobs/new">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </Link>
      </div>

      {/* Jobs list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
              <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <Briefcase className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No jobs posted yet</h2>
          <p className="text-sm text-slate-400 mb-6">Create your first job posting to start receiving AI-screened applications.</p>
          <Link href="/recruiter/jobs/new">
            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Post Your First Job
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const status = job.is_active ? "active" : "closed";
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Posted {new Date(job.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColor[status] || statusColor.closed}`}>
                        {status}
                      </span>
                      {job.is_active && (
                        <button onClick={() => handleCloseJob(job.id)} className="text-xs font-semibold px-3 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors">
                          Close Job
                        </button>
                      )}
                      <Link href={`/recruiter/jobs/${job.id}/edit`}>
                        <button className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-800 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                          Edit
                        </button>
                      </Link>
                      <Link href={`/recruiter/dashboard?job=${job.id}`}>
                        <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors">
                          View Applicants <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.slice(0, 5).map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                          {r}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
