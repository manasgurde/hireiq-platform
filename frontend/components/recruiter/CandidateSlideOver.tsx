"use client";

import { X, Briefcase, CheckCircle2, Calendar, Mail, FileText, ExternalLink, Brain } from "lucide-react";
import { CandidateApp } from "./CandidatesTable";
import { useAuthStore } from "@/store/authStore";
import { applicationsApi } from "@/lib/api";

interface Props {
  candidateApp: CandidateApp;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const pct = score !== null && score !== undefined ? Math.round(score * 100) : null;
  const color =
    pct === null ? "bg-slate-200" : pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className={`text-xs font-bold ${pct === null ? "text-slate-400" : pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
          {pct !== null ? `${pct}%` : "N/A"}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: pct !== null ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export default function CandidateSlideOver({ candidateApp, onClose, onStatusChange }: Props) {
  const handleAction = async (newStatus: string) => {
    try {
      await applicationsApi.updateStatus(candidateApp.id, newStatus);
      onStatusChange(newStatus);
      if (newStatus === "rejected") {
        onClose();
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const initials = candidateApp.candidate?.email?.charAt(0).toUpperCase() || "?";
  const name = candidateApp.candidate?.email?.split("@")[0] || "Unknown";
  const overallPct =
    candidateApp.overall_score !== null && candidateApp.overall_score !== undefined
      ? Math.round(candidateApp.overall_score * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">Candidate Profile</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Identity */}
          <div className="px-6 py-6 text-center border-b border-slate-100 bg-gradient-to-b from-indigo-50 to-white">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 shadow-lg">
              {initials}
            </div>
            <h3 className="text-xl font-bold text-slate-900 capitalize">{name}</h3>
            <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />
              {candidateApp.candidate?.email}
            </p>
            {overallPct !== null && (
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-slate-900">{overallPct}% AI Match</span>
              </div>
            )}
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* AI Scores */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Evaluation</h4>
              <div className="space-y-3">
                <ScoreBar label="Overall Match" score={candidateApp.overall_score} />
                <ScoreBar label="Experience Fit" score={candidateApp.experience_score} />
                <ScoreBar label="Skills Match" score={candidateApp.skills_score} />
              </div>
            </div>

            {/* Skills */}
            {candidateApp.resume?.parsed_skills && candidateApp.resume.parsed_skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Extracted Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidateApp.resume.parsed_skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Organizations */}
            {candidateApp.resume?.parsed_organizations && candidateApp.resume.parsed_organizations.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  Work History
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidateApp.resume.parsed_organizations.map((org, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium">
                      {org}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume link */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Resume Document
              </h4>
              {(candidateApp.resume?.presigned_url || (candidateApp as any).resume_url) ? (
                <a
                  href={candidateApp.resume?.presigned_url || (candidateApp as any).resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  <FileText className="w-5 h-5 text-indigo-500" />
                  View Original Resume
                  <ExternalLink className="w-4 h-4 ml-auto text-indigo-400" />
                </a>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400 text-sm">
                  <FileText className="w-5 h-5" />
                  Resume not available
                </div>
              )}
            </div>

            {/* Applied date */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Applied On
              </h4>
              <p className="text-sm font-medium text-slate-700">
                {new Date(candidateApp.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex-shrink-0 space-y-2">
          {candidateApp.status === "pending" ? (
            <>
              <button
                onClick={() => handleAction("interview")}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                ✓ Advance to Interview
              </button>
              <button
                onClick={() => handleAction("shortlisted")}
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-semibold rounded-xl transition-colors"
              >
                Shortlist Candidate
              </button>
              <button
                onClick={() => handleAction("rejected")}
                className="w-full py-3 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 text-sm font-medium rounded-xl transition-colors"
              >
                Reject
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="text-center py-3 text-sm font-medium text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                Status: <span className="font-bold text-slate-800 capitalize ml-1">{candidateApp.status}</span>
              </div>
              
              {/* Show email link if they are in interview, shortlisted, or hired phase */}
              {(candidateApp.status === "interview" || candidateApp.status === "shortlisted" || candidateApp.status === "hired") && (
                <button
                  onClick={() => {
                    const to = candidateApp.candidate?.email || "";
                    const jobTitle = candidateApp.job?.title || "our open position";
                    
                    const isInterview = candidateApp.status === "interview";
                    const subject = isInterview 
                      ? `Interview Invitation: ${jobTitle}`
                      : `Job Update: ${jobTitle}`;
                      
                    const body = isInterview
                      ? `Hi ${name},\n\nWe are impressed with your profile and would like to invite you for an interview for the ${jobTitle} position.\n\nPlease let us know your availability for this week.\n\nBest regards,\nRecruiting Team`
                      : `Hi ${name},\n\nCongratulations! We are thrilled to move you forward in the process for the ${jobTitle} position.\n\nPlease find further details attached or expect them shortly.\n\nBest regards,\nRecruiting Team`;

                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.open(gmailUrl, '_blank');
                  }}
                  className="w-full py-3 bg-[#ea4335] hover:bg-[#c5221f] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Candidate via Gmail
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
