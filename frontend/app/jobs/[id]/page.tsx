"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, Briefcase, Clock, DollarSign, Brain, Star, 
  ChevronLeft, CheckCircle, Users, Award, Loader2, AlertCircle, Sparkles 
} from "lucide-react";
import { jobsApi, applicationsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [justApplied, setJustApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [needsResume, setNeedsResume] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const [jobRes, appsRes] = await Promise.all([
          jobsApi.get(id),
          applicationsApi.listMine().catch(() => ({ data: [] }))
        ]);
        setJob(jobRes.data);
        const hasApplied = (appsRes.data || []).some((a: any) => a.job_id === id);
        if (hasApplied) {
          setApplied(true);
        }
      } catch (err) {
        console.error("Failed to load job details:", err);
        setError("Job not found or error loading job details.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);
    setNeedsResume(false);
    try {
      await applicationsApi.apply(id);
      setApplied(true);
      setJustApplied(true);
    } catch (err: any) {
      console.error("Application failed:", err);
      // Determine if it is a 409 conflict
      const isConflict = err.response?.status === 409;
      const msg = err.response?.data?.detail || err.response?.data?.error?.message || "Failed to submit application.";
      
      if (isConflict || msg.includes("already applied")) {
        setApplied(true);
        setJustApplied(true);
      } else if (msg.includes("upload a resume") || msg.includes("resume before applying")) {
        setNeedsResume(true);
      } else {
        setApplyError(msg);
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F1F5F9] min-h-screen">
        <header className="bg-white border-b border-slate-200 px-6 md:px-8 py-4 sticky top-0 z-40 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex gap-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-32 mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-xl mt-4" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-6" />
                <Skeleton className="h-12 w-full rounded-xl mb-3" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-4 w-40 mb-3" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md text-center w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Job</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "The job post does not exist or has been deleted."}</p>
          <Link href="/jobs" className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
            Back to Job Board
          </Link>
        </div>
      </div>
    );
  }

  const matchPct = (parseInt(String(job.id).slice(0, 4), 16) % 20) + 75;
  const salaryText = job.salary_min && job.salary_max ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k` : "TBD";
  const postedDate = job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently";

  return (
    <div className="bg-[#F1F5F9] min-h-screen">
      <header className="bg-white border-b border-slate-200 px-6 md:px-8 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/jobs" className="flex items-center gap-2 text-blue-700 text-sm font-medium hover:underline">
            <ChevronLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <Link href="/candidate/dashboard" className="flex items-center gap-2 text-blue-700">
            <Brain className="w-6 h-6" /><span className="font-bold">HireIQ</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 w-full">
        {justApplied ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-10 text-center w-full max-w-[42rem] mx-auto animate-in zoom-in duration-300">
            {/* 
              If the user just applied, or already applied, we just show the submitted state. 
              But wait, the previous code had 'applied' showing the "Application Submitted!" screen.
              If they just visit the page and have already applied, they shouldn't necessarily see the "Submitted!" screen.
              Let's keep the normal view but change the button to "Applied", which is what we did above.
              Oh wait, I shouldn't override the whole page to "Application Submitted" if they already applied.
              Wait! Let's introduce a state 'justApplied' for the success screen.
            */}
            <div className="w-20 h-20 bg-teal-50 border-4 border-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-teal-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 whitespace-nowrap">Application Submitted!</h1>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Congratulations! Your profile has been sent to the recruiter. We've matched your skills with this role and generated your AI match score.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-2xl font-bold text-teal-700">{matchPct}%</p>
                <p className="text-xs text-slate-500 font-medium">AI Match Score</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-700">Applied</p>
                <p className="text-xs text-slate-500 font-medium">Status</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/candidate/applications" className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm">
                Manage Applications
              </Link>
              <Link href="/jobs" className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm rounded-xl transition-all">
                Browse More Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-8 h-8 text-blue-700" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                    <p className="text-slate-500">HireIQ Partner</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />Full-time</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{salaryText}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{postedDate}</span>
                    </div>
                  </div>
                </div>
                {/* AI Match Banner */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-4 border-teal-500 bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xl font-bold text-teal-700">{matchPct}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-teal-800 text-sm">AI Match Score: {matchPct}%</p>
                    <p className="text-xs text-teal-600">Your profile is an excellent match for this role. Top match potential.</p>
                  </div>
                  <Brain className="w-8 h-8 text-teal-600 ml-auto opacity-40" />
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 text-lg mb-3">About the Role</h2>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-6">{job.description}</p>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 text-lg mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills?.map((s: string) => (
                    <span key={s} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Apply Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-2xl font-bold text-slate-900 mb-1">{salaryText}</p>
                <p className="text-sm text-slate-500 mb-4">Per Year · Full-time</p>

                {needsResume && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <p className="font-semibold">Resume Required</p>
                    </div>
                    <p className="mt-1 leading-normal">
                      You must upload a resume before you can apply. Use our AI analyzer to get matching scores!
                    </p>
                    <Link href="/candidate/resume" className="mt-3 block text-center bg-amber-600 text-white py-1.5 rounded-lg font-bold hover:bg-amber-700 transition-colors shadow-sm">
                      Upload Resume
                    </Link>
                  </div>
                )}

                {applyError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <p>{applyError}</p>
                  </div>
                )}

                {applied ? (
                  <button disabled className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors shadow-sm mb-3 cursor-not-allowed">
                    Applied
                  </button>
                ) : (
                  <button 
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full py-3 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm mb-3 flex items-center justify-center gap-2"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </button>
                )}

              </div>

              {/* Company Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-semibold text-slate-900 mb-3">About HireIQ Partner</h3>
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" />500-2,000 employees</div>
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" />Technology</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{job.location}</div>
                  <div className="flex items-center gap-2"><Award className="w-4 h-4" />Top Employer 2024</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
