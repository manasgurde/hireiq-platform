"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain, Search, Filter, Download, ChevronLeft, ThumbsUp, ThumbsDown,
  CheckSquare, Square, MoreVertical, X, TrendingUp, CheckCircle, AlertCircle, Users,
  Code, Briefcase, FileText, MapPin, Phone, Mail
} from "lucide-react";
import { applicationsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = ["All", "applied", "shortlisted", "interview", "rejected"];

export default function ApplicantsRankingPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedDrawer, setSelectedDrawer] = useState<any | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await applicationsApi.listAllForRecruiter();
        const mapped = (res.data || []).map((app: any, idx: number) => ({
          id: app.id,
          name: app.candidate?.email?.split("@")[0] || "Unknown",
          email: app.candidate?.email || "",
          currentRole: app.job?.title || "Candidate",
          linkedin: app.candidate?.linkedin_url,
          github: app.candidate?.github_url,
          phone: app.candidate?.phone_number,
          location: app.candidate?.location,
          resumeUrl: app.resume?.url,
          appliedDate: new Date(app.created_at).toLocaleDateString(),
          aiScore: app.overall_score ? (app.overall_score <= 1 ? Math.round(app.overall_score * 100) : Math.round(app.overall_score)) : 0,
          status: app.status || "applied",
          skills: {
            matched: app.resume?.parsed_skills || [],
            missing: []
          },
          breakdown: {
            skills: app.skills_score ? (app.skills_score <= 1 ? Math.round(app.skills_score * 100) : Math.round(app.skills_score)) : 0,
            experience: app.experience_score ? (app.experience_score <= 1 ? Math.round(app.experience_score * 100) : Math.round(app.experience_score)) : 0,
            culture: 80
          },
          experience: [],
          rank: idx + 1
        }));
        setCandidates(mapped);
      } catch (error) {
        console.error("Failed to load candidates", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const [sortField, setSortField] = useState<"overall" | "experience" | "skills">("overall");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const toggleSort = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };

  const filtered = candidates.filter((c) => {
    const matchTab = activeTab === "All" || c.status === activeTab;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  }).sort((a, b) => {
    let valA = a.aiScore;
    let valB = b.aiScore;
    if (sortField === "experience") {
      valA = a.breakdown.experience;
      valB = b.breakdown.experience;
    } else if (sortField === "skills") {
      valA = a.breakdown.skills;
      valB = b.breakdown.skills;
    }

    if (sortOrder === "desc") {
      return valB - valA;
    }
    return valA - valB;
  });

  const toggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-amber-100 border-amber-400 text-amber-700";
    if (rank === 2) return "bg-slate-100 border-slate-400 text-slate-700";
    if (rank === 3) return "bg-orange-100 border-orange-400 text-orange-700";
    return "bg-slate-50 border-slate-300 text-slate-600";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "border-emerald-500 bg-emerald-50 text-emerald-700";
    if (score >= 60) return "border-teal-500 bg-teal-50 text-teal-700";
    return "border-orange-400 bg-orange-50 text-orange-700";
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await applicationsApi.updateStatus(id, status);
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      
      if (selectedDrawer?.id === id) {
        setSelectedDrawer({ ...selectedDrawer, status });
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    for (const id of selected) {
      await updateStatus(id, status);
    }
    setSelected([]);
  };

  if (loading) {
    return (
      <div className="bg-[#F1F5F9] min-h-screen p-8">
        <Skeleton className="w-full h-32 mb-6 rounded-2xl" />
        <Skeleton className="w-full h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-blue-700 font-medium mb-2">
          <Link href="/recruiter/dashboard" className="flex items-center gap-1 hover:underline">
            <ChevronLeft className="w-4 h-4" />Back to Dashboard
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">All Candidates</h1>
            </div>
            <div className="flex items-center gap-5 text-slate-500 text-sm mt-1">
              <span>Total Applicants: {candidates.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-slate-50 px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 flex-shrink-0 overflow-x-auto">
        <div className="flex bg-slate-200 rounded-xl p-1 gap-0.5">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
              activeTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={sortField} 
              onChange={(e) => setSortField(e.target.value as any)}
              className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none"
            >
              <option value="overall">Sort: Overall AI Score</option>
              <option value="experience">Sort: Experience</option>
              <option value="skills">Sort: Skills</option>
            </select>
            <button onClick={toggleSort} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 shadow-sm hover:bg-slate-50 whitespace-nowrap">
              <Filter className="w-4 h-4" />{sortOrder === "desc" ? "High to Low" : "Low to High"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {/* Bulk Actions */}
          {selected.length > 0 && (
            <div className="mb-4 bg-blue-700 text-white rounded-xl p-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckSquare className="w-4 h-4" />{selected.length} Candidates Selected
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => bulkUpdateStatus("shortlisted")} className="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-50">Shortlist Selected</button>
                <button onClick={() => bulkUpdateStatus("rejected")} className="px-3 py-1.5 border border-white/50 rounded-lg text-xs font-semibold hover:bg-white/10">Reject Selected</button>
              </div>
            </div>
          )}

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No candidates found</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <input type="checkbox" className="rounded" onChange={(e) => {
                        if (e.target.checked) setSelected(filtered.map(c => c.id));
                        else setSelected([]);
                      }} checked={selected.length === filtered.length && filtered.length > 0} />
                    </th>
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4">Candidate</th>
                    <th className="p-4 text-center">AI Score</th>
                    <th className="p-4">Matched Skills</th>
                    <th className="p-4">Applied</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c.id} onClick={() => setSelectedDrawer(c)}
                      className={`cursor-pointer transition-colors group ${
                        selectedDrawer?.id === c.id ? "bg-blue-50" :
                        c.rank === 1 ? "bg-amber-50/50 hover:bg-amber-50" :
                        "hover:bg-slate-50"
                      }`}>
                      <td className="p-4 text-center" onClick={(e) => { e.stopPropagation(); toggleSelect(c.id); }}>
                        <input type="checkbox" className="rounded" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                      </td>
                      <td className="p-4 text-center">
                        <div className={`w-8 h-8 rounded-full border-2 font-bold text-sm flex items-center justify-center mx-auto shadow-sm ${getRankBadge(c.rank)}`}>
                          {c.rank}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.currentRole}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full border-4 font-bold text-sm shadow-sm ${getScoreColor(c.aiScore)}`}>
                          {c.aiScore}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {c.skills.matched.slice(0, 3).map((s: string) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs truncate max-w-[100px]">{s}</span>
                          ))}
                          {c.skills.matched.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-xs">+{c.skills.matched.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{c.appliedDate}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                          c.status === "shortlisted" ? "bg-purple-50 text-purple-700 border-purple-200" : 
                          c.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                          c.status === "interview" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>{c.status}</span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(c.id, "shortlisted"); }} className="p-1.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800" title="Shortlist">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(c.id, "rejected"); }} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200" title="Reject">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Candidate Drawer */}
        {selectedDrawer && (
          <div className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col flex-shrink-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-700 text-white flex items-center justify-center text-lg font-bold border-2 border-white shadow-sm">
                  {selectedDrawer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{selectedDrawer.name}</h2>
                  <p className="text-xs text-slate-500">{selectedDrawer.currentRole}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDrawer(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* AI Evaluation */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-700" />AI Evaluation
                </h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100,100" strokeWidth="3" />
                      <path className="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${selectedDrawer.aiScore},100`} strokeLinecap="round" strokeWidth="3" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-emerald-700">{selectedDrawer.aiScore}</span>
                      <span className="text-xs text-slate-400">Score</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[
                      { label: "Skills Match", val: selectedDrawer.breakdown.skills },
                      { label: "Experience Level", val: selectedDrawer.breakdown.experience },
                      { label: "Culture Fit", val: selectedDrawer.breakdown.culture },
                    ].map((b) => (
                      <div key={b.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">{b.label}</span>
                          <span className="font-semibold text-emerald-700">{b.val}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full">
                          <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${b.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Candidate Links & Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-700" />Candidate Profile
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  {selectedDrawer.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {selectedDrawer.location}
                    </div>
                  )}
                  {selectedDrawer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" /> {selectedDrawer.phone}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedDrawer.linkedin && (
                      <a href={selectedDrawer.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors">
                        <Briefcase className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                    {selectedDrawer.github && (
                      <a href={selectedDrawer.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors">
                        <Code className="w-3.5 h-3.5" /> GitHub
                      </a>
                    )}
                    {selectedDrawer.resumeUrl && (
                      <a href={selectedDrawer.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Resume
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">Matched Skills</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedDrawer.skills.matched.map((s: string) => (
                    <span key={s} className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />{s}
                    </span>
                  ))}
                  {selectedDrawer.skills.matched.length === 0 && (
                    <p className="text-xs text-slate-500">No matched skills extracted.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 space-y-3">
              <div className="flex gap-2">
                <button onClick={() => updateStatus(selectedDrawer.id, "rejected")} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors">Reject</button>
                <button onClick={() => updateStatus(selectedDrawer.id, "interview")} className="flex-1 py-2 border border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors">Interview</button>
                <button onClick={() => updateStatus(selectedDrawer.id, "hired")} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">Accept</button>
              </div>

              {(selectedDrawer.status === "interview" || selectedDrawer.status === "hired") && (
                <button
                  onClick={() => {
                    const to = selectedDrawer.email || "";
                    const jobTitle = selectedDrawer.currentRole || "our open position";
                    const isInterview = selectedDrawer.status === "interview";
                    const subject = isInterview ? `Interview Invitation: ${jobTitle}` : `Job Update: ${jobTitle}`;
                    const body = isInterview
                      ? `Hi ${selectedDrawer.name},\n\nWe are impressed with your profile and would like to invite you for an interview for the ${jobTitle} position.\n\nPlease let us know your availability for this week.\n\nBest regards,\nRecruiting Team`
                      : `Hi ${selectedDrawer.name},\n\nCongratulations! We are thrilled to move you forward in the process for the ${jobTitle} position.\n\nPlease find further details attached or expect them shortly.\n\nBest regards,\nRecruiting Team`;
                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.open(gmailUrl, '_blank');
                  }}
                  className="w-full py-2 bg-[#ea4335] hover:bg-[#c5221f] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Candidate via Gmail
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
