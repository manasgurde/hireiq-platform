"use client";

import { useEffect, useState } from "react";
import {
  User,
  FileText,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from "lucide-react";
import CandidateSlideOver from "./CandidateSlideOver";
import { useAuthStore } from "@/store/authStore";
import { applicationsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export interface CandidateApp {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  overall_score: number | null;
  experience_score: number | null;
  skills_score: number | null;
  created_at: string;
  resume?: {
    id: string;
    parsed_skills: string[];
    parsed_organizations: string[];
    s3_key: string;
    presigned_url?: string;
  };
  candidate?: {
    email: string;
    id: string;
  };
  job?: {
    title: string;
    [key: string]: any;
  };
}

type SortKey = "overall_score" | "experience_score" | "skills_score";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-slate-400 font-medium">N/A</span>;
  }
  const pct = Math.round(score * 100);
  const color =
    pct >= 80
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : pct >= 50
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
      {pct}%
    </span>
  );
}

function SortButton({
  label,
  sortKey,
  current,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: { key: SortKey; dir: "asc" | "desc" };
  onSort: (k: SortKey) => void;
}) {
  const active = current.key === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
        active
          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
      }`}
    >
      {label}
      {active ? (
        current.dir === "desc" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
      )}
    </button>
  );
}

export default function CandidatesTable({ jobId }: { jobId: string }) {
  const [candidates, setCandidates] = useState<CandidateApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CandidateApp | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "overall_score",
    dir: "desc",
  });

  useEffect(() => {
    async function fetch_() {
      if (!jobId) return;
      setLoading(true);
      try {
        const res = await applicationsApi.listByJob(jobId);
        setCandidates(res.data || []);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [jobId]);

  const handleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { key, dir: "desc" }
    );
  };

  const sorted = [...candidates].sort((a, b) => {
    const av = a[sort.key] ?? -1;
    const bv = b[sort.key] ?? -1;
    return sort.dir === "desc" ? bv - av : av - bv;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    interview: "bg-indigo-50 text-indigo-700 border-indigo-200",
    shortlisted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="p-5 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">No candidates yet</p>
        <p className="text-xs text-slate-400 mt-1">Applications will appear here once candidates apply.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Candidate Shortlisting</h2>
            <p className="text-xs text-slate-500 mt-0.5">{candidates.length} applicants · Sort by AI scores</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Sort:</span>
            <SortButton label="Overall" sortKey="overall_score" current={sort} onSort={handleSort} />
            <SortButton label="Experience" sortKey="experience_score" current={sort} onSort={handleSort} />
            <SortButton label="Skills" sortKey="skills_score" current={sort} onSort={handleSort} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overall
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((c) => {
                const initials = c.candidate?.email?.charAt(0).toUpperCase() || "?";
                const statusClass = statusColors[c.status] || "bg-slate-100 text-slate-600 border-slate-200";
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {c.candidate?.email?.split("@")[0] || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-400">{c.candidate?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <ScoreBadge score={c.overall_score} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <ScoreBadge score={c.experience_score} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <ScoreBadge score={c.skills_score} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusClass}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        View <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <CandidateSlideOver
          candidateApp={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(newStatus) => {
            setCandidates((prev) =>
              prev.map((c) => (c.id === selected.id ? { ...c, status: newStatus } : c))
            );
            setSelected({ ...selected, status: newStatus });
          }}
        />
      )}
    </>
  );
}
