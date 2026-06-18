"use client";

import { X, Check, FileText, Briefcase, Calendar, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandidateApp } from "./CandidatesTable";

interface CandidateSlideOverProps {
  candidateApp: CandidateApp;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}

export default function CandidateSlideOver({ candidateApp, onClose, onStatusChange }: CandidateSlideOverProps) {
  const handleAction = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("hireiq_token");
      const res = await fetch(`http://localhost:8000/api/v1/applications/${candidateApp.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onStatusChange(newStatus);
        onClose();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const scoreColor = candidateApp.ai_match_score >= 0.8 ? "text-green-400" : candidateApp.ai_match_score >= 0.5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" /> Candidate Profile
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Identity & Match */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center mb-2">
              <User className="w-10 h-10 text-slate-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{candidateApp.candidate?.name || "Unknown"}</h3>
              <p className="text-slate-400 flex items-center justify-center gap-1.5 mt-1">
                <Mail className="w-4 h-4" /> {candidateApp.candidate?.email}
              </p>
            </div>
            <div className="mt-4 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="text-sm text-slate-400 font-medium">AI Match</div>
              <div className={`text-2xl font-black ${scoreColor}`}>
                {Math.round(candidateApp.ai_match_score * 100)}%
              </div>
            </div>
          </div>

          {/* Parsed Info */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Parsed Organizations
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidateApp.resume?.parsed_organizations?.map((org, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm">
                    {org}
                  </span>
                )) || <span className="text-slate-500 text-sm">No organizations detected</span>}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" /> Extracted Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidateApp.resume?.parsed_skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                )) || <span className="text-slate-500 text-sm">No skills detected</span>}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Applied
              </h4>
              <p className="text-slate-300 font-medium">{new Date(candidateApp.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex flex-col gap-3">
          {candidateApp.status === "pending" && (
            <>
              <Button 
                onClick={() => handleAction("interview")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 py-6"
              >
                Advance to Interview Stage
              </Button>
              <Button 
                onClick={() => handleAction("rejected")}
                variant="destructive"
                className="w-full py-6 bg-red-950 text-red-400 hover:bg-red-900 border border-red-900"
              >
                Reject Candidate
              </Button>
            </>
          )}
          {candidateApp.status !== "pending" && (
            <div className="text-center py-3 text-sm font-medium text-slate-400">
              Candidate is currently marked as <span className="uppercase text-slate-300 border-b border-slate-700 pb-0.5">{candidateApp.status}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
