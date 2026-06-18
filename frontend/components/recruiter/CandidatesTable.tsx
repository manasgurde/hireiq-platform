"use client";

import { useEffect, useState } from "react";
import { User, FileText, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import CandidateSlideOver from "./CandidateSlideOver";

export interface CandidateApp {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  ai_match_score: number;
  created_at: string;
  resume?: {
    id: string;
    parsed_skills: string[];
    parsed_organizations: string[];
    s3_key: string;
  };
  candidate?: {
    email: string;
    name?: string;
  };
}

export default function CandidatesTable({ jobId }: { jobId: string }) {
  const [candidates, setCandidates] = useState<CandidateApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApp | null>(null);

  useEffect(() => {
    async function fetchCandidates() {
      if (!jobId) return;
      try {
        const token = localStorage.getItem("hireiq_token");
        const res = await fetch(`http://localhost:8000/api/v1/jobs/${jobId}/applications`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Sort descending by AI Match Score
          const sorted = data.sort((a: CandidateApp, b: CandidateApp) => b.ai_match_score - a.ai_match_score);
          setCandidates(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch candidates", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, [jobId]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-400 bg-green-500/10 border-green-500/20";
    if (score >= 0.5) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const getScoreRing = (score: number) => {
    const dashArray = 2 * Math.PI * 16;
    const dashOffset = dashArray - score * dashArray;
    const color = score >= 0.8 ? "#4ade80" : score >= 0.5 ? "#facc15" : "#f87171";

    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" stroke="#1e293b" strokeWidth="3" />
          <circle 
            cx="18" cy="18" r="16" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={dashArray} strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-xs font-bold text-slate-200">
          {Math.round(score * 100)}%
        </div>
      </div>
    );
  };

  if (loading) return <div className="h-64 flex items-center justify-center text-indigo-400 animate-pulse">Loading candidates...</div>;

  if (candidates.length === 0) {
    return (
      <div className="p-12 text-center border border-slate-800 rounded-xl bg-slate-900/50">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400 font-medium">No candidates have applied to this job yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 text-sm border-b border-slate-800">
                <th className="px-6 py-4 font-semibold">Candidate</th>
                <th className="px-6 py-4 font-semibold">AI Match Score</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {candidates.map((c) => (
                <tr 
                  key={c.id} 
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => setSelectedCandidate(c)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-indigo-500 transition-colors">
                        <User className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{c.candidate?.name || "Unknown Candidate"}</div>
                        <div className="text-xs text-slate-500">{c.candidate?.email || "No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getScoreRing(c.ai_match_score)}
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getScoreColor(c.ai_match_score)}`}>
                        {c.ai_match_score >= 0.8 ? "High Match" : c.ai_match_score >= 0.5 ? "Medium Match" : "Low Match"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm font-medium text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCandidate && (
        <CandidateSlideOver 
          candidateApp={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
          onStatusChange={(newStatus) => {
            setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? { ...c, status: newStatus } : c));
            setSelectedCandidate({ ...selectedCandidate, status: newStatus });
          }}
        />
      )}
    </>
  );
}
