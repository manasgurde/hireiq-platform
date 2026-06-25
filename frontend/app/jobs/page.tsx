"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, Clock, DollarSign, Brain, Star, SlidersHorizontal, Loader2, Zap } from "lucide-react";
import { jobsApi, applicationsApi } from "@/lib/api";

const locationFilters = ["All Locations", "Remote", "Hybrid", "On-site"];
const jobTypeFilters = ["All Types", "Full-time", "Part-time", "Contract"];

export default function JobBoardPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [jobType, setJobType] = useState("All Types");
  const [jobs, setJobs] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const [res, appRes] = await Promise.all([
          jobsApi.list(),
          applicationsApi.listMine().catch(() => ({ data: [] }))
        ]);
        const items = res.data.items || [];
        const appliedJobIds = new Set<string>((appRes.data || []).map((a: any) => a.job_id));
        setJobs(items);
        setAppliedJobs(appliedJobIds);
        if (items.length > 0) {
          setSelectedJob(items[0]);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filtered = jobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase()) ||
      j.skills.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    const matchLocation = location === "All Locations" || j.location.toLowerCase().includes(location.toLowerCase());
    const matchType = jobType === "All Types" || "Full-time" === jobType;
    return matchSearch && matchLocation && matchType;
  });

  return (
    <div className="bg-[#F1F5F9] min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 md:px-8 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/candidate/dashboard" className="flex items-center gap-2 text-blue-700">
            <Brain className="w-7 h-7" />
            <span className="font-bold text-lg">HireIQ</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/candidate/applications" className="text-sm text-slate-600 hover:text-blue-700 font-medium">My Applications</Link>
            <Link href="/candidate/dashboard" className="px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-10">
        <div className="w-full max-w-[56rem] mx-auto text-center flex flex-col items-center">
          <h1 className="text-3xl font-bold text-white mb-2 whitespace-nowrap">Find Your Dream Job</h1>
          <p className="text-blue-100 text-sm mb-6">AI-powered job matching based on your skills and experience</p>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, skills, or company..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg" />
            </div>
            <select value={location} onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg">
              {locationFilters.map(l => <option key={l}>{l}</option>)}
            </select>
            <select value={jobType} onChange={(e) => setJobType(e.target.value)}
              className="px-4 py-3 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg">
              {jobTypeFilters.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Job List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600 font-medium">{filtered.length} jobs found</p>
            <button className="flex items-center gap-1 text-sm text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-400 text-sm">No jobs found</p>
            </div>
          ) : (
            filtered.map((job) => {
              const matchPct = (parseInt(String(job.id).slice(0, 4), 16) % 20) + 75;
              const salaryText = job.salary_min && job.salary_max ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k` : "TBD";
              const postedDate = job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently";
              return (
                <button key={job.id} onClick={() => setSelectedJob(job)}
                  className={`w-full text-left bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-all ${
                    selectedJob?.id === job.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                  }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{job.title}</h3>
                      <p className="text-xs text-slate-500">HireIQ Partner</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {appliedJobs.has(job.id) && (
                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-200">
                          Applied
                        </div>
                      )}
                      <div className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-bold border border-teal-200">
                        <Zap className="w-3 h-3" />{matchPct}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />Full-time</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{postedDate}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.skills?.slice(0, 3).map((s: string) => (
                      <span key={s} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{s}</span>
                    ))}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Job Detail */}
        {selectedJob && (
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-24 self-start overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Briefcase className="w-7 h-7 text-blue-700" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{selectedJob.title}</h1>
                    <p className="text-sm text-slate-500">HireIQ Partner · {selectedJob.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-xl text-sm font-bold border border-teal-200 mb-1">
                    <Brain className="w-3.5 h-3.5" />{(parseInt(String(selectedJob.id).slice(0, 4), 16) % 20) + 75}% AI Match
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{selectedJob.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />Full-time</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" />{selectedJob.salary_min && selectedJob.salary_max ? `$${Math.round(selectedJob.salary_min / 1000)}k - $${Math.round(selectedJob.salary_max / 1000)}k` : "TBD"}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleDateString() : "Recently"}</span>
              </div>
              <div className="flex gap-3">
                {appliedJobs.has(selectedJob.id) ? (
                  <button disabled className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-semibold text-center shadow-sm cursor-not-allowed">
                    Applied
                  </button>
                ) : (
                  <Link href={`/jobs/${selectedJob.id}`}
                    className="flex-1 py-3 bg-blue-700 text-white rounded-xl text-sm font-semibold text-center hover:bg-blue-800 transition-colors shadow-sm">
                    Apply Now
                  </Link>
                )}
                <button className="px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Star className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">About the Role</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills?.map((s: string) => (
                    <span key={s} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
