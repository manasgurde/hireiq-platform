"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { applicationsApi, resumesApi, Resume } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { user } = useAuthStore();
  const firstName = user?.full_name?.split(" ")[0] || "Candidate";

  const [applications, setApplications] = useState<any[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideSkillGap, setHideSkillGap] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, resumeRes] = await Promise.allSettled([
          applicationsApi.listMine(),
          resumesApi.getMine()
        ]);

        if (appsRes.status === "fulfilled") {
          setApplications(appsRes.value.data || []);
        }
        if (resumeRes.status === "fulfilled") {
          setResume(resumeRes.value.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats
  const applicationsSent = applications.length;
  const shortlistedCount = applications.filter(a => a.status === "shortlisted").length;
  const interviewingCount = applications.filter(a => a.status === "interviewing" || a.status === "interview").length;
  const profileViews = 0; // Backend currently doesn't track generic profile views
  
  // Resume score mapping
  const resumeScore = resume?.ai_evaluation?.rating || 0;
  const topMatchText = resumeScore > 80 ? "Top 5% Match" : resumeScore > 70 ? "Top 15% Match" : "Good Match";
  const missingSkillsRaw = resume?.ai_evaluation?.suggestions || [];
  const missingSkills = missingSkillsRaw
    .flatMap(s => typeof s === 'string' ? s.split(/(?:,\s*and\s+|\s+and\s+)/i) : [])
    .map(s => {
      let cleaned = s.replace(/^(adding|refine the|include|consider|focus on|you should|you might want to)\s+/i, '');
      cleaned = cleaned.replace(/["']/g, '').replace(/\.$/, '').trim();
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    })
    .filter(Boolean)
    .slice(0, 3);
  const hasSkillGap = missingSkills.length > 0;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusConfig = (status: string) => {
    switch(status?.toLowerCase()) {
      case "shortlisted":
        return { bg: "bg-tertiary-fixed", text: "text-on-tertiary-container", dot: "bg-tertiary-container", border: "border-tertiary-fixed-dim" };
      case "interviewing":
      case "interview":
        return { bg: "bg-secondary-fixed", text: "text-on-secondary-container", dot: "bg-secondary-container", border: "border-secondary-fixed-dim" };
      case "rejected":
        return { bg: "bg-error-container", text: "text-on-error-container", dot: "bg-error", border: "border-error/20" };
      default:
        return { bg: "bg-surface-variant", text: "text-on-surface", dot: "bg-primary", border: "border-outline-variant" };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <section className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-24 w-full md:w-64" />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          <Skeleton className="md:col-span-4 h-80 rounded-xl" />
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="flex justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-on-surface mb-1">Welcome back, {firstName}!</h1>
            <p className="font-body-base text-body-base text-on-surface-variant">Here is your daily AI-driven career overview.</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-outline-variant w-full md:w-64">
            <div className="flex justify-between items-center mb-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Profile Completion</span>
              <span className="font-body-sm text-body-sm font-semibold text-primary">{resume ? "100%" : "20%"}</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: resume ? "100%" : "20%" }}></div>
            </div>
          </div>
        </div>
      </section>

      {!resume && (
        <div className="bg-surface-variant border border-outline-variant rounded-lg p-4 mb-8 flex items-start gap-4 shadow-sm">
          <span className="material-symbols-outlined text-primary mt-0.5">info</span>
          <div>
            <h3 className="font-body-base text-body-base font-semibold text-on-surface">No Resume Found</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Upload your resume to unlock AI scoring, job recommendations, and 1-click apply!
            </p>
          </div>
          <a href="/candidate/resume" className="ml-auto bg-primary text-on-primary px-4 py-2 rounded-md font-medium text-sm transition-colors hover:bg-primary/90">
            Upload Now
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant p-8 flex flex-col items-center justify-center text-center relative overflow-hidden glass-panel">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed-dim/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h3 className="font-h3 text-h3 text-on-surface mb-6">AI Resume Score</h3>
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="#e2e8f0" strokeWidth="8"></circle>
              <circle className="transition-all duration-1000 ease-out" cx="50" cy="50" fill="none" r="45" stroke="#0F766E" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * resumeScore) / 100} strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display-xl text-display-xl text-tertiary-container">{resumeScore || "-"}</span>
              <span className="font-caption text-caption text-on-surface-variant font-medium">/ 100</span>
            </div>
          </div>
          {resume && (
            <>
              <div className="flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-container px-4 py-1 rounded-full mb-4">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span className="font-body-sm text-body-sm font-medium">{topMatchText}</span>
              </div>
              <a href="/candidate/resume" className="text-primary hover:text-primary-container font-body-sm text-body-sm font-medium underline transition-colors">
                  View Full Analysis
              </a>
            </>
          )}
        </div>

        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                <span className="material-symbols-outlined">send</span>
              </div>
            </div>
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Applications Sent</p>
              <h2 className="font-h2 text-h2 text-on-surface">{applicationsSent}</h2>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined">bookmark_added</span>
              </div>
            </div>
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Shortlisted</p>
              <h2 className="font-h2 text-h2 text-on-surface">{shortlistedCount}</h2>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                <span className="material-symbols-outlined">visibility</span>
              </div>
            </div>
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Profile Views</p>
              <h2 className="font-h2 text-h2 text-on-surface">{profileViews}</h2>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
            </div>
            <div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Interviews Scheduled</p>
              <h2 className="font-h2 text-h2 text-on-surface">{interviewingCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {resume && hasSkillGap && !hideSkillGap && (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 mb-12 flex items-start gap-4 shadow-sm">
          <span className="material-symbols-outlined text-primary mt-0.5 text-2xl">lightbulb</span>
          <div className="flex-1">
            <h3 className="font-h3 text-h3 text-on-surface mb-2">Skill Gap Detected</h3>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              <p className="mb-3">Based on your resume and market trends, consider developing these skills to increase your match rate:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm font-medium text-on-surface">
                {missingSkills.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>
          <button onClick={() => setHideSkillGap(true)} className="ml-auto text-on-surface-variant hover:bg-surface-variant p-2 rounded-md transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-h3 text-h3 text-on-surface">Jobs Recommended for You</h2>
            <a className="text-primary font-body-sm text-body-sm font-medium hover:underline" href="/jobs">View All</a>
          </div>
          <div className="space-y-6">
            {!resume ? (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 text-center">
                <p className="text-on-surface-variant text-sm">Upload a resume to get personalized job recommendations.</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant overflow-hidden">
                      <span className="material-symbols-outlined text-primary">work</span>
                    </div>
                    <div>
                      <h3 className="font-h3 text-h3 text-on-surface text-[18px]">Software Engineer</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">TechNova Solutions · Remote</p>
                    </div>
                  </div>
                  <div className="bg-tertiary-fixed text-on-tertiary-container px-2 py-1 rounded-md text-xs font-bold border border-tertiary-fixed-dim flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    92% Match
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {(resume.ai_evaluation?.good_points || ["React", "TypeScript", "Node.js"]).slice(0, 3).map(skill => (
                    <span key={skill} className="bg-surface-container-low text-on-surface-variant px-4 py-1 rounded-full text-xs font-medium border border-outline-variant">{skill}</span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">$120k - $150k</span>
                  <a href="/jobs" className="bg-primary-container text-on-primary px-6 py-2 rounded-lg font-body-sm text-body-sm font-medium hover:bg-primary transition-colors shadow-sm">
                    View Details
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-h3 text-h3 text-on-surface">Recent Applications</h2>
            <a className="text-primary font-body-sm text-body-sm font-medium hover:underline" href="/candidate/applications">Manage All</a>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="p-4 font-body-sm text-body-sm font-medium text-on-surface-variant">Role / Company</th>
                    <th className="p-4 font-body-sm text-body-sm font-medium text-on-surface-variant">Date Applied</th>
                    <th className="p-4 font-body-sm text-body-sm font-medium text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-on-surface-variant text-sm">
                        You haven't applied to any jobs yet.
                      </td>
                    </tr>
                  ) : (
                    applications.slice(0, 5).map((app) => {
                      const statusConf = getStatusConfig(app.status);
                      return (
                        <tr key={app.id} className="border-b border-outline-variant hover:bg-surface-container-lowest/50 transition-colors">
                          <td className="p-4">
                            <p className="font-body-base text-body-base font-medium text-on-surface">{app.job?.title || "Unknown Role"}</p>
                            <p className="font-caption text-caption text-on-surface-variant">Company Name</p>
                          </td>
                          <td className="p-4 font-body-sm text-body-sm text-on-surface-variant">{formatDate(app.created_at)}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text} border ${statusConf.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}></span>
                              {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : "Unknown"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
